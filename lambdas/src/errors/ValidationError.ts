import { ApiError } from './ApiError'

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}
