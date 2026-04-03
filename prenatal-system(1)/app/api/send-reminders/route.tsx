import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendAppointmentReminderEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verify the request is from a cron job (optional security measure)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get appointments that are 24 hours from now (with a 1-hour window)
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000)

    const { data: appointments, error } = await supabase
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
      .gte("appointment_date", tomorrow.toISOString())
      .lte("appointment_date", tomorrowEnd.toISOString())
      .eq("status", "scheduled")

    if (error) {
      console.error("[v0] Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ message: "No appointments to remind", count: 0 })
    }

    const emailPromises = appointments.map(async (appointment: any) => {
      const patient = appointment.patients

      if (!patient?.email) {
        console.log(`[v0] No email for patient ${patient?.first_name} ${patient?.last_name}`)
        return null
      }

      const appointmentDate = new Date(appointment.appointment_date)

      try {
        const { data, error } = await sendAppointmentReminderEmail({
          to: patient.email,
          firstName: patient.first_name,
          lastName: patient.last_name,
          appointmentType: appointment.appointment_type,
          appointmentDate,
          durationMinutes: appointment.duration_minutes,
          notes: appointment.notes,
        })

        if (error) {
          console.error(`[v0] Error sending email to ${patient.email}:`, error)
          return { success: false, email: patient.email, error }
        }

        console.log(`[v0] Reminder sent to ${patient.email}`)
        return { success: true, email: patient.email, messageId: data?.id }
      } catch (error) {
        console.error(`[v0] Exception sending email to ${patient.email}:`, error)
        return { success: false, email: patient.email, error }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter((r) => r?.success).length

    return NextResponse.json({
      message: "Reminders processed",
      total: appointments.length,
      sent: successCount,
      failed: appointments.length - successCount,
      results,
    })
  } catch (error) {
    console.error("[v0] Error in send-reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
