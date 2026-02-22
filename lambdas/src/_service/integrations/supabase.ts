import { AuthResponse, createClient, SupabaseClient, UserResponse } from '@supabase/supabase-js'
import { AuthenticatedUser } from '../types/auth'
import { ApiError } from '../../errors'
import { createRemoteJWKSet, jwtVerify, JWTVerifyResult } from 'jose'

export interface Supabase {
  login(email: string, password: string): Promise<AuthenticatedUser>
  signup(email: string, password: string): Promise<AuthResponse>
  signupAsAdmin(email: string, password: string): Promise<UserResponse>
  verifyToken(token: string): Promise<JWTVerifyResult>
}

export class SupabaseImpl implements Supabase {
  private supabaseClient: SupabaseClient
  private PROJECT_JWKS: ReturnType<typeof createRemoteJWKSet>
  private supabaseUrl: string
  private supabaseServiceRoleKey: string
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL!
    this.supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    this.supabaseClient = createClient(this.supabaseUrl, this.supabaseServiceRoleKey)

    this.PROJECT_JWKS = createRemoteJWKSet(
      new URL(`${this.supabaseUrl}/auth/v1/.well-known/jwks.json`)
    )
  }

  async login(email: string, password: string): Promise<AuthenticatedUser> {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (error && error.code) {
      const message = error.code
      throw new ApiError(message)
    }
    return {
      id: data.user?.id,
      email: data.user?.email,
      last_sign_in_at: data.user?.last_sign_in_at,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token
    } as AuthenticatedUser
  }

  async signup(email: string, password: string): Promise<AuthResponse> {
    const result = await this.supabaseClient.auth.signUp({
      email,
      password
    })

    if (result.error && result.error.code) {
      const message = result.error.code
      throw new ApiError(message)
    }
    return result
  }

  async signupAsAdmin(email: string, password: string): Promise<UserResponse> {
    const result = await this.supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (result.error && result.error.code) {
      const message = result.error.code
      throw new ApiError(message)
    }
    return result
  }

  async verifyToken(token: string): Promise<JWTVerifyResult> {
    return jwtVerify(token, this.PROJECT_JWKS)
  }
}
