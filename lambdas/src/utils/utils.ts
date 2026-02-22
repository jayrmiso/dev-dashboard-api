import { AuthError } from '@supabase/supabase-js'
import { ApiAuthRequest } from '../api/common'

export const retrieveToken = (event: ApiAuthRequest): string => {
  if (!event.authorizationToken) {
    throw new AuthError('Missing access token.')
  }

  return event.authorizationToken.replace('Bearer ', '')
}
