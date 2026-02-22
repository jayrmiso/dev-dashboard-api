import { APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export type ApiRequest = APIGatewayProxyEvent
export type ApiResponse = APIGatewayProxyResult
export type ApiAuthRequest = APIGatewayAuthorizerEvent & { authorizationToken: string }
export type ApiAuthResponse = APIGatewayAuthorizerResult

export type ResponseDto = {
  id: string
  created: string
  modified: string
  createdBy: string
  modifiedBy?: string
}
