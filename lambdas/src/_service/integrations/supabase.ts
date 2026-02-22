import { AuthResponse, createClient, SupabaseClient, UserResponse } from '@supabase/supabase-js'
import { AuthenticatedUser } from '../types/auth'
import { ApiError } from '../../errors'

export interface Supabase {
  login(email: string, password: string): Promise<AuthenticatedUser>
  signup(email: string, password: string): Promise<AuthResponse>
  signupAsAdmin(email: string, password: string): Promise<UserResponse>
}

export class SupabaseImpl implements Supabase {
  private supabaseClient: SupabaseClient

  constructor() {
    console.log(process.env.SUPABASE_URL)
    this.supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
}
