import { ZodError } from 'zod'
import { ApiError } from '../errors/ApiError'
import { CORS_HEADERS } from '../common/constants'
import { ApiRequest, ApiResponse } from '../api/common'

interface ApiMeta {
  requestId: string
  timestamp: string
}

interface SuccessResponse<T> {
  success: true
  data: T
  meta: ApiMeta
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
  meta: ApiMeta
}

function buildMeta(requestId?: string): ApiMeta {
  return {
    requestId: requestId || 'unknown',
    timestamp: new Date().toISOString()
  }
}

export function setResponse<T>(statusCode: number, data: T, event?: ApiRequest): ApiResponse {
  const body: SuccessResponse<T> = {
    success: true,
    data,
    meta: buildMeta(event?.requestContext?.requestId)
  }
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  }
}

export function setErrorResponse(error: Error | unknown, source: string, event?: ApiRequest): ApiResponse {
  console.error(`[${source}]`, error)

  const meta = buildMeta(event?.requestContext?.requestId)

  if (error instanceof ZodError) {
    const body: ErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: error.issues.map((e) => ({ path: e.path.join('.'), message: e.message }))
      },
      meta
    }
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify(body) }
  }

  if (error instanceof ApiError) {
    const body: ErrorResponse = {
      success: false,
      error: {
        code: error.code || error.name,
        message: error.message
      },
      meta
    }
    return { statusCode: error.statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) }
  }

  const body: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal Server Error'
    },
    meta
  }
  return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify(body) }
}
