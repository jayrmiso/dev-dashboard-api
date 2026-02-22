import * as cdk from 'aws-cdk-lib/core'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { LambdaFunction } from '../constructs/LambdaFunction'
import routes from '../../config/routes.json'

export interface LambdaStackProps extends cdk.StackProps {
  envVars: { [key: string]: string }
}

export class LambdaStack extends cdk.Stack {
  public readonly integrations: Record<string, LambdaIntegration> = {}
  public readonly authorizerFn: LambdaFunction
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props)

    const { envVars } = props

    for (const route of routes) {
      const sanitizedId = route.lambda.replace(/\//g, '-')
      const fn = new LambdaFunction(this, sanitizedId, route.lambda, envVars)
      this.integrations[route.lambda] = new LambdaIntegration(fn)
    }

    this.authorizerFn = new LambdaFunction(this, 'authorizer', 'auth/authorizer', envVars)
  }
}
