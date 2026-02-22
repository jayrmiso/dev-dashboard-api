import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export type ApiRequest = APIGatewayProxyEvent
export type ApiResponse = APIGatewayProxyResult

export type ResponseDto = {
  id: string
  created: string
  modified: string
  createdBy: string
  modifiedBy?: string
}
