import * as cdk from 'aws-cdk-lib/core'
import { RestApi, Cors, LambdaIntegration, IResource } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import routes from '../../config/routes.json'

export interface ApiStackProps extends cdk.StackProps {
  integrations: Record<string, LambdaIntegration>
}

export class ApiStack extends cdk.Stack {
  public readonly api: RestApi

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    this.api = new RestApi(this, 'DevDashboardApi', {
      restApiName: 'Dev Dashboard API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      },
      deployOptions: {
        throttlingRateLimit: 10,
        throttlingBurstLimit: 20
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

      resource.addMethod(route.method, props.integrations[route.lambda])
    }
  }
}
