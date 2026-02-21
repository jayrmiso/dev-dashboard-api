import * as fs from 'fs'
import * as path from 'path'

type Route = {
  lambda: string
  path: string
  method: string
}

const routes: Route[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../config/routes.json'), 'utf-8')
)

const toPascalCase = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

const resources = routes
  .map((route) => {
    const resourceName = toPascalCase(route.lambda)
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
            Method: ${route.method}
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: es2022
        EntryPoints:
          - handler.ts`
  })
  .join('\n\n')

const template = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Auto-generated local dev template

Globals:
  Function:
    Runtime: nodejs20.x
    MemorySize: 128
    Timeout: 10

Resources:
${resources}
`

const outPath = path.resolve(__dirname, '../template.local.yaml')
fs.writeFileSync(outPath, template)
console.log(`Generated ${outPath} with ${routes.length} route(s)`)
