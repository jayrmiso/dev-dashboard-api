export type AuthenticationResult = {
  token: string
}

export type AuthenticatedUser = {
  id: string
  email: string
  last_sign_in_at: string
  access_token: string
  refresh_token: string
}