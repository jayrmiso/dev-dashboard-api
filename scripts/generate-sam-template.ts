import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'

type Route = {
  lambda: string
  path: string
  method: string
  auth: boolean
}

const routes: Route[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../config/routes.json'), 'utf-8')
)

const toResourceName = (str: string): string =>
  str
    .split(/[-/]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')

const envVarNames = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'DATABASE_URL']

const hasAuthRoutes = routes.some((r) => r.auth)

const resources = routes
  .map((route) => {
    const resourceName = toResourceName(route.lambda)
    const authBlock = route.auth
      ? `
            Auth:
              Authorizer: SupabaseAuthorizer`
      : ''
    return `  ${resourceName}:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: ${route.lambda}
      Handler: handler.handler
      CodeUri: lambdas/src/${route.lambda}/
      Events:
        ${resourceName}Event:
          Type: Api
          Properties:
            Path: /api${route.path}
            Method: ${route.method}${authBlock}
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: es2022
        EntryPoints:
          - handler.ts`
  })
  .join('\n\n')

const authorizerResource = hasAuthRoutes
  ? `
  SupabaseAuthorizerFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: authorizer
      Handler: handler.handler
      CodeUri: lambdas/src/auth/authorizer/
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: es2022
        EntryPoints:
          - handler.ts

  UnauthorizedResponse:
    Type: AWS::ApiGateway::GatewayResponse
    Properties:
      RestApiId: !Ref ServerlessRestApi
      ResponseType: UNAUTHORIZED
      StatusCode: '401'
      ResponseParameters:
        gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
      ResponseTemplates:
        application/json: '{"success":false,"error":{"code":"UNAUTHORIZED","message":"$context.authorizer.error"},"meta":{"requestId":"$context.requestId","timestamp":"$context.requestTime"}}'

  AccessDeniedResponse:
    Type: AWS::ApiGateway::GatewayResponse
    Properties:
      RestApiId: !Ref ServerlessRestApi
      ResponseType: ACCESS_DENIED
      StatusCode: '403'
      ResponseParameters:
        gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
      ResponseTemplates:
        application/json: '{"success":false,"error":{"code":"ACCESS_DENIED","message":"Access denied"},"meta":{"requestId":"$context.requestId","timestamp":"$context.requestTime"}}'`
  : ''

const authSection = hasAuthRoutes
  ? `
  Api:
    Auth:
      DefaultAuthorizer: NONE
      Authorizers:
        SupabaseAuthorizer:
          FunctionArn: !GetAtt SupabaseAuthorizerFunction.Arn`
  : ''

const globalEnvBlock = envVarNames.map((v) => `        ${v}: '${process.env[v] || ''}'`).join('\n')

const template = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Auto-generated local dev template

Globals:
  Function:
    Runtime: nodejs20.x
    MemorySize: 128
    Timeout: 10
    Environment:
      Variables:
${globalEnvBlock}${authSection}

Resources:
${resources}
${authorizerResource}
`

const outPath = path.resolve(__dirname, '../template.local.yaml')
fs.writeFileSync(outPath, template)
console.log(`Generated ${outPath} with ${routes.length} route(s)`)
