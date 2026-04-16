import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { sendWelcomeEmail } from "@/lib/email"

const STAFF_ROLES = new Set(["doctor", "nurse", "admin"])

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params

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

  // Get the user_id to check if they need password reset or new invite
  const { data: patientWithUserId } = await supabase
    .from("patients")
    .select("user_id")
    .eq("id", patientId)
    .single()

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
  }

  const adminClient = createSupabaseAdminClient(process.env.SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const appOrigin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  let userIdForPatient = patientWithUserId?.user_id ?? null

  // If patient has user_id, they might already be registered - send password reset instead
  if (userIdForPatient) {
    const { data: resetData, error: resetLinkError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: patient.email,
      options: {
        redirectTo: `${appOrigin}/auth/reset-password-complete`,
      },
    })

    if (resetLinkError) {
      console.error("Error generating reset link:", resetLinkError)
      return NextResponse.json({ error: "Failed to generate setup link" }, { status: 500 })
    }

    const passwordSetupLink = resetData.properties?.action_link || `${appOrigin}/auth/reset-password-complete`

    // Just resend the welcome email again since they're already registered
    try {
      await sendWelcomeEmail({
        to: patient.email,
        firstName: patient.first_name,
        lastName: patient.last_name,
        passwordSetupLink,
      })
      console.log(`Welcome email resent to ${patient.email} (existing user)`)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, emailType: "welcome_resent" })
  }

  // If no user_id, create user and send welcome email
  // Create user in Supabase
  const { data: userData, error: createUserError } = await adminClient.auth.admin.createUser({
    email: patient.email,
    email_confirm: false,
    user_metadata: {
      full_name: `${patient.first_name} ${patient.last_name}`.trim(),
      role: "patient",
    },
  })

  if (createUserError) {
    const normalizedMessage = createUserError.message.toLowerCase()
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

    console.error("User creation error:", createUserError)
    return NextResponse.json({ error: createUserError.message }, { status: 400 })
  }

  // Update patient record with user_id
  if (userData.user?.id) {
    await supabase
      .from("patients")
      .update({ user_id: userData.user.id })
      .eq("id", patientId)
  }

  const { data: resetData, error: resetLinkError } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: patient.email,
    options: {
      redirectTo: `${appOrigin}/auth/reset-password-complete`,
    },
  })

  if (resetLinkError) {
    console.error("Error generating reset link:", resetLinkError)
    return NextResponse.json({ error: "Failed to generate setup link" }, { status: 500 })
  }

  const passwordSetupLink = resetData.properties?.action_link || `${appOrigin}/auth/reset-password-complete`

  // Send welcome email via Resend
  try {
    await sendWelcomeEmail({
      to: patient.email,
      firstName: patient.first_name,
      lastName: patient.last_name,
      passwordSetupLink,
    })
    console.log(`Welcome email resent to ${patient.email}`)
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError)
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, emailType: "welcome" })
}
