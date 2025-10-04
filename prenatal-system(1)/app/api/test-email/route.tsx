import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Prenatal Care <onboarding@resend.dev>",
      to: ["delivered@resend.dev"], // Resend test email
      subject: "Test Email - Prenatal Care System",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to right, #0ea5e9, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Email Configuration Test</h1>
              </div>
              <div class="content">
                <p>Congratulations! Your email system is configured correctly.</p>
                <p>This test email confirms that:</p>
                <ul>
                  <li>Resend API key is valid</li>
                  <li>Email sending is working</li>
                  <li>HTML templates are rendering properly</li>
                </ul>
                <p>You can now send appointment reminders to your patients.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
