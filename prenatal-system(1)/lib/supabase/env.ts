// This module reads environment variables at module load time
// using a workaround for Next.js standalone mode

// Cache the values immediately when this module is imported
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || null
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || null

export function getSupabaseUrl(): string | null {
  return supabaseUrl
}

export function getSupabaseAnonKey(): string | null {
  return supabaseAnonKey
}

export function getSupabaseCredentials(): { url: string | null; anonKey: string | null } {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  }
}
