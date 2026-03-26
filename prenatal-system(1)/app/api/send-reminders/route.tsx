import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
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
        const { data, error } = await resend.emails.send({
          from: "Prenatal Care <onboarding@resend.dev>", // Replace with your verified domain
          to: [patient.email],
          subject: "Appointment Reminder - Tomorrow",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(to right, #0ea5e9, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                  .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
                  .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
                  .detail-row:last-child { border-bottom: none; }
                  .label { font-weight: bold; color: #64748b; }
                  .value { color: #0f172a; }
                  .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">Appointment Reminder</h1>
                  </div>
                  <div class="content">
                    <p>Dear ${patient.first_name} ${patient.last_name},</p>
                    <p>This is a friendly reminder about your upcoming appointment tomorrow.</p>
                    
                    <div class="appointment-details">
                      <h2 style="margin-top: 0; color: #0ea5e9;">Appointment Details</h2>
                      <div class="detail-row">
                        <span class="label">Type:</span>
                        <span class="value" style="text-transform: capitalize;">${appointment.appointment_type}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Date:</span>
                        <span class="value">${appointmentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Time:</span>
                        <span class="value">${appointmentDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Duration:</span>
                        <span class="value">${appointment.duration_minutes} minutes</span>
                      </div>
                    </div>

                    ${
                      appointment.notes
                        ? `
                      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Note:</strong> ${appointment.notes}</p>
                      </div>
                    `
                        : ""
                    }

                    <p>Please arrive 10 minutes early for check-in. If you need to reschedule or cancel, please contact us as soon as possible.</p>
                    
                    <p>We look forward to seeing you!</p>
                    
                    <p style="margin-top: 30px;">
                      Best regards,<br>
                      <strong>Your Prenatal Care Team</strong>
                    </p>
                  </div>
                  <div class="footer">
                    <p>This is an automated reminder. Please do not reply to this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
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
