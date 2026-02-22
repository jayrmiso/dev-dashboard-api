import { StatementEffect } from 'aws-lambda'
import { Supabase } from '../../_service/integrations/supabase'
import { ApiAuthRequest, ApiAuthResponse } from '../../api/common'
import { retrieveToken } from '../../utils/utils'

export const authorizer = async (event: ApiAuthRequest, supabase: Supabase): Promise<ApiAuthResponse> => {
  const token = retrieveToken(event)

  try {
    const { payload } = await supabase.verifyToken(token)

    return generatePolicy(payload.sub as string, 'Allow', event.methodArn, {
      userId: payload.sub as string,
      email: payload.email as string
    })
  } catch (error: any) {
    console.error('[authorizer]', error)

    const message = error?.code === 'ERR_JWT_EXPIRED' ? 'Token expired' : 'Unauthorized'

    return generatePolicy('unauthorized', 'Deny', event.methodArn, {
      error: message
    })
  }
}

const generatePolicy = (
  principalId: string,
  effect: StatementEffect,
  resource: string,
  context?: Record<string, string>
): ApiAuthResponse => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    },
    ...(context && { context })
  }
}
