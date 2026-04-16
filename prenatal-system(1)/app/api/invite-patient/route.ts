import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"

const STAFF_ROLES = new Set(["doctor", "nurse", "admin"])

export async function POST(request: Request) {
  try {
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
      console.error("[invite-patient] Missing SUPABASE_SERVICE_ROLE_KEY")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const brevoApiKey = process.env.BREVO_API_KEY
    if (!brevoApiKey) {
      console.error("[invite-patient] Missing BREVO_API_KEY")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const adminClient = createSupabaseClient(process.env.SUPABASE_URL!, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const appOrigin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    // Check if patient already exists by email before creating auth user
    const { data: existingByEmail } = await adminClient
      .from("patients")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingByEmail?.id) {
      return NextResponse.json(
        { error: "A patient with this email address already exists.", patientId: existingByEmail.id },
        { status: 409 },
      )
    }

    // Create user in Supabase
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        full_name: `${payload.firstName} ${payload.lastName}`,
        role: "patient",
      },
    })

    if (inviteError) {
      console.error("Supabase user creation error:", inviteError)
      return NextResponse.json(
        { error: inviteError.message || "Failed to create user account" },
        { status: 500 },
      )
    }

    // Generate a proper password reset link with Supabase token
    const { data: resetData, error: resetError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${appOrigin}/auth/reset-password-complete`,
      },
    })

    if (resetError) {
      console.error("Error generating reset link:", resetError)
      return NextResponse.json({ error: "Failed to generate setup link" }, { status: 500 })
    }

    const passwordSetupLink = resetData.properties?.action_link || `${appOrigin}/auth/reset-password-complete`

    const invitedUserId = inviteData.user?.id ?? null

    if (invitedUserId) {
      const { data: existing } = await adminClient
        .from("patients")
        .select("id")
        .eq("user_id", invitedUserId)
        .maybeSingle()

      if (existing?.id) {
        return NextResponse.json(
          { error: "Patient record already linked to this account.", patientId: existing.id },
          { status: 409 },
        )
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
      console.error("Patient creation error:", patientError)
      return NextResponse.json({ error: patientError.message }, { status: 400 })
    }

    // Send welcome email via Resend
    try {
      await sendWelcomeEmail({
        to: email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        passwordSetupLink,
      })
      console.log(`Welcome email sent to ${email}`)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({
      ok: true,
      patientId: patient?.id,
      inviteSent: true,
      invitedUserId,
    })
  } catch (error) {
    console.error("[invite-patient] Unexpected error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
