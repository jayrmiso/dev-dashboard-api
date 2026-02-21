import * as cdk from 'aws-cdk-lib/core'
import { Template } from 'aws-cdk-lib/assertions'
import { LambdaStack } from '../../lib/stacks/LambdaStack'

describe('LambdaStack', () => {
  const app = new cdk.App()
  const stack = new LambdaStack(app, 'TestLambdaStack', {
    envVars: { TEST_VAR: 'test-value' }
  })
  const template = Template.fromStack(stack)

  it('should create the health Lambda function', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'health',
      Runtime: 'nodejs20.x',
      MemorySize: 128,
      Timeout: 10
    })
  })
})
