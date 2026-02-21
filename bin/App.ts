#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core'
import { LambdaStack } from '../lib/stacks/LambdaStack'
import { ApiStack } from '../lib/stacks/ApiStack'

const app = new cdk.App()

const envVars: { [key: string]: string } = {}

const lambdaStack = new LambdaStack(app, 'DevDashboardLambdaStack', {
  envVars,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
})

new ApiStack(app, 'DevDashboardApiStack', {
  integrations: lambdaStack.integrations,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
})
