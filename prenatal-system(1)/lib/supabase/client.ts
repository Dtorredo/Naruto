import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseCredentials } from "./env"

// Declare the global window type
declare global {
  interface Window {
    __SUPABASE_URL?: string
    __SUPABASE_ANON_KEY?: string
  }
}

function getSupabaseCreds() {
  // In browser, always prefer runtime-injected values from window
  if (typeof window !== "undefined") {
    const url = window.__SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const anonKey = window.__SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    return { url, anonKey }
  }
  
  // Server-side: use the env module which caches values at import time
  const { url, anonKey } = getSupabaseCredentials()
  return { url, anonKey }
}

export function createClient() {
  const { url, anonKey } = getSupabaseCreds()

  if (!url || !anonKey) {
    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client! " +
      "Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY) " +
      "are set in your Fly.io secrets."
    )
  }

  return createBrowserClient(url, anonKey)
}
