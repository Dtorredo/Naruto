import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

const STAFF_ROLES = new Set(["doctor", "nurse", "admin"])

export async function POST(request: Request) {
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

  const payload = await request.json()
  const email = (payload.email as string | null)?.trim() || ""

  if (!email) {
    return NextResponse.json({ error: "Patient email is required to send an invite." }, { status: 400 })
  }

  if (!payload.firstName || !payload.lastName || !payload.dateOfBirth || !payload.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
  }

  const adminClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const redirectTo =
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${request.headers.get("origin")}/auth/redirect`

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      full_name: `${payload.firstName} ${payload.lastName}`,
      role: "patient",
    },
  })

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 })
  }

  const invitedUserId = inviteData.user?.id ?? null
  const inviteSent = true

  if (invitedUserId) {
    const { data: existing } = await adminClient
      .from("patients")
      .select("id")
      .eq("user_id", invitedUserId)
      .maybeSingle()

    if (existing?.id) {
      return NextResponse.json({ error: "Patient record already linked to this account." }, { status: 409 })
    }
  }

  const { data: patient, error: patientError } = await adminClient
    .from("patients")
    .insert({
      first_name: payload.firstName,
      last_name: payload.lastName,
      date_of_birth: payload.dateOfBirth,
      email: email || null,
      phone: payload.phone,
      address: payload.address || null,
      emergency_contact_name: payload.emergencyContactName || null,
      emergency_contact_phone: payload.emergencyContactPhone || null,
      blood_type: payload.bloodType || null,
      allergies: payload.allergies || null,
      medical_history: payload.medicalHistory || null,
      user_id: invitedUserId,
    })
    .select("id")
    .single()

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    patientId: patient?.id,
    inviteSent,
    invitedUserId,
  })
}
