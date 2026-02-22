import { ApiRequest } from '../api/common'
import { ZodType } from 'zod'

export function validatePayload<T>(event: ApiRequest, payload: ZodType<T>): T {
  return payload.parse(JSON.parse(event.body || '{}'))
}
