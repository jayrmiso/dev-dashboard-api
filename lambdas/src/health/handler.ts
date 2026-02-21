import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { setResponse, setErrorResponse } from '../utils/response'
import { HealthService } from './HealthService'

const healthService = new HealthService()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log("testinggg")
    return setResponse(200, healthService.check())
  } catch (error) {
    return setErrorResponse(error, 'health.handler')
  }
}
