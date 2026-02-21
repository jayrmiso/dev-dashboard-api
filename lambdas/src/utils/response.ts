import { APIGatewayProxyResult } from 'aws-lambda'
import { ApiError } from '../errors/ApiError'
import { CORS_HEADERS } from '../common/constants'

export function setResponse<T>(statusCode: number, payload: T): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(payload)
  }
}

export function setErrorResponse(error: Error | unknown, source: string): APIGatewayProxyResult {
  console.error(`[${source}]`, error)

  if (error instanceof ApiError) {
    return setResponse(error.statusCode, {
      message: error.message,
      code: error.code
    })
  }

  return setResponse(500, { message: 'Internal Server Error' })
}
