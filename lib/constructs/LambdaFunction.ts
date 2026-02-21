import { Duration } from 'aws-cdk-lib/core'
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Role } from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import * as path from 'path'

export class LambdaFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, envVars: { [key: string]: string }, lambdaRole?: Role) {
    super(scope, id, {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.resolve(__dirname, `../../lambdas/src/${id}/handler.ts`),
      environment: envVars,
      role: lambdaRole,
      memorySize: 128,
      timeout: Duration.seconds(10),
      functionName: id,
      tracing: Tracing.DISABLED,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
        forceDockerBundling: false
      }
    })
  }
}
