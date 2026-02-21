import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { setErrorResponse, setResponse } from '../../utils/response'
import { SupabaseImpl } from '../../_service/integrations/supabase'

export const signup = async (
  event: APIGatewayProxyEvent,
  _supabase: SupabaseImpl
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event)
    return setResponse(200, {})
  } catch (error) {
    return setErrorResponse(error, 'signup')
  }
}
