import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseCredentials } from "./env"

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseCredentials()

  if (!url || !anonKey) {
    throw new Error("Supabase URL and Anon Key are missing at runtime on the server!")
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
