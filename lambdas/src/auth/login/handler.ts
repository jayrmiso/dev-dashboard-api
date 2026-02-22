import { SupabaseImpl } from '../../_service/integrations/supabase'
import { ApiRequest, ApiResponse } from '../../api/common'
import { login } from './login'

export const handler = async (event: ApiRequest): Promise<ApiResponse> => {
  const supabase = new SupabaseImpl()
  const result = await login(event, supabase)

  return result
}
