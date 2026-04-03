import { NextResponse } from "next/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const adminClient = createSupabaseAdminClient(
      process.env.SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    // Check if user exists
    const { data: users, error: userError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    })

    if (userError) {
      console.error("Error fetching users:", userError)
      return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    }

    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({ 
        message: "If an account exists with this email, a password reset link has been sent." 
      })
    }

    // Generate password reset link
    const origin = request.headers.get("origin") || process.env.SUPABASE_URL?.replace(/\/$/, '')
    const resetLink = `${origin}/auth/reset-password-complete?token=reset_${user.id}`

    // Get user's first name from metadata
    const firstName = user.user_metadata?.full_name?.split(" ")[0] || "User"

    // Send reset email via Resend
    try {
      await sendPasswordResetEmail({
        to: email,
        firstName,
        resetLink,
      })
      console.log(`Password reset email sent to ${email}`)
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "If an account exists with this email, a password reset link has been sent." 
    })
  } catch (error) {
    console.error("Error in forgot-password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
