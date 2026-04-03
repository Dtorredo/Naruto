import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendAppointmentCreatedEmail } from "@/lib/email"

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

    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    // Fetch appointment details with patient info
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patients (
          first_name,
          last_name,
          email
        )
      `,
      )
      .eq("id", appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const patient = appointment.patients

    if (!patient?.email) {
      return NextResponse.json({ 
        message: "Patient has no email, skipping notification",
        appointmentId 
      }, { status: 200 })
    }

    const appointmentDate = new Date(appointment.appointment_date)

    // Send email notification
    const { data: emailData, error: emailError } = await sendAppointmentCreatedEmail({
      to: patient.email,
      firstName: patient.first_name,
      lastName: patient.last_name,
      appointmentType: appointment.appointment_type,
      appointmentDate,
      durationMinutes: appointment.duration_minutes,
      notes: appointment.notes,
    })

    if (emailError) {
      console.error("Error sending appointment notification:", emailError)
      return NextResponse.json({ 
        error: "Failed to send email notification",
        details: emailError 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: "Appointment notification sent successfully",
      emailId: emailData?.id,
      appointmentId,
    })
  } catch (error) {
    console.error("Error in notify-appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
