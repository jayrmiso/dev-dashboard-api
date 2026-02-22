import { ApiError } from './ApiError'

export class AuthorizationError extends ApiError {
  constructor(message = 'Not Authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}
