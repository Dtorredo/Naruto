import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.json({
      ok: false,
      stage: "getUser",
      user: user ?? null,
      userError: userError?.message ?? null,
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single()

  return NextResponse.json({
    ok: !profileError,
    user: { id: user.id, email: user.email },
    profile,
    profileError: profileError
      ? {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        }
      : null,
  })
}
