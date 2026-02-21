import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { AuthenticationResult } from '../types/auth'

export interface Supabase {
  login(email: string, password: string): Promise<AuthenticationResult>
  signup(email: string, password: string): Promise<{ result: object }>
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

  async login(email: string, password: string): Promise<AuthenticationResult> {
    const result = await this.supabaseClient.auth.signInWithPassword({
      email,
      password
    })
    return {
      token: '',
      result
    } as AuthenticationResult
  }

  async signup(email: string, password: string): Promise<{ result: object }> {
    const result = await this.supabaseClient.auth.signUp({
      email,
      password
    })

    return {
      result
    }
  }
}
