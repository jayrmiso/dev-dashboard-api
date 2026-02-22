#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core'
import { LambdaStack } from '../lib/stacks/LambdaStack'
import { ApiStack } from '../lib/stacks/ApiStack'

const app = new cdk.App()

const envVars: { [key: string]: string } = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || ''
}

const lambdaStack = new LambdaStack(app, 'DevDashboardLambdaStack', {
  envVars,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
})

new ApiStack(app, 'DevDashboardApiStack', {
  integrations: lambdaStack.integrations,
  authorizerFn: lambdaStack.authorizerFn,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
})
