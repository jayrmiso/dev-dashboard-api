export class ApiError extends Error {
  public statusCode: number
  public code: string

  constructor(message: string, statusCode = 500, code = 'API_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'ApiError'
  }
}
