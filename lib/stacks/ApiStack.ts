import * as cdk from 'aws-cdk-lib/core'
import {
  RestApi,
  Cors,
  LambdaIntegration,
  IResource,
  ApiKey,
  UsagePlan,
  ApiKeySourceType,
  Period,
  TokenAuthorizer,
  GatewayResponse,
  ResponseType
} from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import routes from '../../config/routes.json'
import { LambdaFunction } from '../constructs/LambdaFunction'

const ALLOWED_IPS = (process.env.ALLOWED_IPS || '').split(',').filter(Boolean)

export interface ApiStackProps extends cdk.StackProps {
  integrations: Record<string, LambdaIntegration>
  envVars: { [key: string]: string }
}

export class ApiStack extends cdk.Stack {
  public readonly api: RestApi

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    const authorizerFn = new LambdaFunction(this, 'authorizer', 'auth/authorizer', props.envVars)

    const auth = new TokenAuthorizer(this, 'SupabaseAuthorizer', {
      handler: authorizerFn,
      identitySource: 'method.request.header.Authorization'
    })

    this.api = new RestApi(this, 'DevDashboardApi', {
      restApiName: 'Dev Dashboard API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'x-api-key']
      },
      deployOptions: {
        throttlingRateLimit: 2,
        throttlingBurstLimit: 5
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*']
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            principals: [new iam.AnyPrincipal()],
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/*'],
            conditions: {
              NotIpAddress: {
                'aws:SourceIp': ALLOWED_IPS
              }
            }
          })
        ]
      })
    })

    // Public API key — for health, login (low quota)
    const publicApiKey = new ApiKey(this, 'PublicApiKey', {
      apiKeyName: 'dev-dashboard-public-key',
      description: 'API key for public routes (health, login)'
    })

    const publicUsagePlan = new UsagePlan(this, 'PublicUsagePlan', {
      name: 'dev-dashboard-public-plan',
      throttle: { rateLimit: 2, burstLimit: 5 },
      quota: { limit: 100, period: Period.DAY }
    })

    publicUsagePlan.addApiStage({ stage: this.api.deploymentStage })
    publicUsagePlan.addApiKey(publicApiKey)

    // Private API key — for protected routes (higher quota)
    const privateApiKey = new ApiKey(this, 'PrivateApiKey', {
      apiKeyName: 'dev-dashboard-private-key',
      description: 'API key for protected routes (auth required)'
    })

    const privateUsagePlan = new UsagePlan(this, 'PrivateUsagePlan', {
      name: 'dev-dashboard-private-plan',
      throttle: { rateLimit: 5, burstLimit: 10 },
      quota: { limit: 5000, period: Period.DAY }
    })

    privateUsagePlan.addApiStage({ stage: this.api.deploymentStage })
    privateUsagePlan.addApiKey(privateApiKey)

    new GatewayResponse(this, 'UnauthorizedResponse', {
      restApi: this.api,
      type: ResponseType.UNAUTHORIZED,
      statusCode: '401',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'"
      },
      templates: {
        'application/json':
          '{"success":false,"error":{"code":"UNAUTHORIZED","message":"$context.authorizer.error"},"meta":{"requestId":"$context.requestId","timestamp":"$context.requestTime"}}'
      }
    })

    new GatewayResponse(this, 'AccessDeniedResponse', {
      restApi: this.api,
      type: ResponseType.ACCESS_DENIED,
      statusCode: '403',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'"
      },
      templates: {
        'application/json':
          '{"success":false,"error":{"code":"ACCESS_DENIED","message":"Access denied"},"meta":{"requestId":"$context.requestId","timestamp":"$context.requestTime"}}'
      }
    })

    const api = this.api.root.addResource('api')

    for (const route of routes) {
      const segments = route.path.split('/').filter(Boolean)
      let resource: IResource = api

      for (const segment of segments) {
        const existing = resource.getResource(segment)
        resource = existing ?? resource.addResource(segment)
      }

      resource.addMethod(route.method, props.integrations[route.lambda], {
        apiKeyRequired: true,
        ...(route.auth && { authorizer: auth })
      })
    }

    new cdk.CfnOutput(this, 'PublicApiKeyId', {
      value: publicApiKey.keyId,
      description: 'Public API Key ID (for health, login)'
    })

    new cdk.CfnOutput(this, 'PrivateApiKeyId', {
      value: privateApiKey.keyId,
      description: 'Private API Key ID (for protected routes)'
    })
  }
}
