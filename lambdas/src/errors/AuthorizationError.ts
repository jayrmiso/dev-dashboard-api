import { ApiError } from './ApiError'

export class AuthorizationError extends ApiError {
  constructor(message = 'Not Authorized') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}
