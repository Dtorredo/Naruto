import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

const STAFF_ROLES = new Set(["doctor", "nurse", "admin"])

type RouteParams = {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const patientId = params?.id

  if (!patientId) {
    return NextResponse.json({ error: "Patient id is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.role || !STAFF_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("first_name, last_name, email")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  if (!patient.email) {
    return NextResponse.json({ error: "Patient record is missing an email address." }, { status: 400 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
  }

  const adminClient = createSupabaseAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const redirectTo =
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${origin}/auth/set-password?email=${encodeURIComponent(patient.email)}`

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(patient.email, {
    redirectTo,
    data: {
      full_name: `${patient.first_name} ${patient.last_name}`.trim(),
      role: "patient",
    },
  })

  if (inviteError) {
    const normalizedMessage = inviteError.message.toLowerCase()
    const alreadyRegisteredPhrases = [
      "already registered",
      "already been registered",
      "already exists",
      "already have an account",
    ]

    if (alreadyRegisteredPhrases.some((phrase) => normalizedMessage.includes(phrase))) {
      return NextResponse.json(
        { error: "This patient already activated their account. Ask them to reset their password instead." },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: inviteError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
