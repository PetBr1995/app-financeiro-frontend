import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let browserClient: SupabaseClient | null = null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado no frontend.')
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl as string, supabasePublishableKey as string)
  }

  return browserClient
}
