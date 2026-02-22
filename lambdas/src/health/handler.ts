import { ApiRequest, ApiResponse } from '../api/common'
import { setResponse, setErrorResponse } from '../utils/response'
import { HealthService } from './HealthService'

const healthService = new HealthService()

export const handler = async (event: ApiRequest): Promise<ApiResponse> => {
  try {
    return setResponse(200, healthService.check(), event)
  } catch (error) {
    return setErrorResponse(error, 'health', event)
  }
}
