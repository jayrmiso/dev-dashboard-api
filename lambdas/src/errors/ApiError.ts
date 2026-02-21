export class ApiError extends Error {
  public statusCode: number
  public code: string | undefined

  constructor(message: string, statusCode = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'ApiError'
  }
}
