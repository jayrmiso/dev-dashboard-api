import { ApiRequest, ApiResponse } from '../../api/common'
import { Supabase } from '../../_service/integrations/supabase'
import z from 'zod'
import { setErrorResponse, setResponse } from '../../utils/response'
import { validatePayload } from '../../utils/validation'

const loginPayload = z.object({
  email: z.string().email(),
  password: z.string()
})

export const login = async (event: ApiRequest, supabase: Supabase): Promise<ApiResponse> => {
  try {
    const payload = validatePayload(event, loginPayload)

    const result = await supabase.login(payload.email, payload.password)

    return setResponse(201, result, event)
  } catch (error) {
    return setErrorResponse(error, 'login')
  }
}
