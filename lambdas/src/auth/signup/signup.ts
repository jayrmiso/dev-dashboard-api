import { ApiRequest, ApiResponse } from '../../api/common'
import { setErrorResponse, setResponse } from '../../utils/response'
import { Supabase } from '../../_service/integrations/supabase'
import z from 'zod'
import { validatePayload } from '../../utils/validation'

const signupPayload = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  email_confirm: z.boolean().optional()
})

export const signup = async (event: ApiRequest, supabase: Supabase): Promise<ApiResponse> => {
  try {
    const payload = validatePayload(event, signupPayload)
    let result
    if (payload.email_confirm)
      result = await supabase.signupAsAdmin(payload.email, payload.password)
    else {
      result = await supabase.signup(payload.email, payload.password)
    }

    return setResponse(201, result, event)
  } catch (error) {
    return setErrorResponse(error, 'signup', event)
  }
}
