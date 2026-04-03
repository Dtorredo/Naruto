const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

export const EMAIL_FROM = {
  email: "narutoobayo@gmail.com",
  name: "Prenatal Care",
}

async function sendEmail(params: {
  to: string
  subject: string
  htmlContent: string
  sender?: { email: string; name: string }
}) {
  const { to, subject, htmlContent, sender = EMAIL_FROM } = params

  const apiKey = process.env.BREVO_API_KEY
  
  if (!apiKey) {
    console.error("[Brevo] API key is not configured!")
    throw new Error("Brevo API key is not configured")
  }

  console.log(`[Brevo] Sending email to ${to} with subject: ${subject}`)

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[Brevo] Email send failed:", error)
    throw new Error(error.message || "Failed to send email")
  }

  const result = await response.json()
  console.log(`[Brevo] Email sent successfully to ${to}, messageId: ${result.messageId}`)
  return result
}

export async function sendWelcomeEmail(params: {
  to: string
  firstName: string
  lastName: string
  passwordSetupLink: string
}) {
  const { to, firstName, lastName, passwordSetupLink } = params

  return sendEmail({
    to,
    subject: "Welcome to Prenatal Care Portal",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; font-size: 16px; opacity: 0.9; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .welcome-text { font-size: 18px; color: #1a202c; margin-bottom: 20px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; margin: 30px 0; text-align: center; }
            .cta-button:hover { background: linear-gradient(135deg, #5568d3 0%, #6a3f91 100%); }
            .info-box { background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .info-box h3 { margin-top: 0; color: #2d3748; }
            .footer { text-align: center; padding: 30px 20px; color: #718096; font-size: 14px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Prenatal Care</h1>
              <p>Your Health Portal is Ready</p>
            </div>
            <div class="content">
              <p class="welcome-text">Dear ${firstName} ${lastName},</p>
              <p>We're excited to welcome you to our Prenatal Care Portal! Your account has been created by your healthcare provider.</p>
              
              <div class="info-box">
                <h3>Get Started</h3>
                <p style="margin-bottom: 20px;">To access your portal, please set up your password by clicking the button below:</p>
                <a href="${passwordSetupLink}" class="cta-button">Set Up Your Password</a>
              </div>

              <p><strong>What you can do in the portal:</strong></p>
              <ul style="color: #4a5568;">
                <li>View your medical records and prenatal information</li>
                <li>Check upcoming appointments</li>
                <li>Access your profile and personal details</li>
                <li>Review checkup history and test results</li>
              </ul>

              <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact your healthcare provider.</p>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Your Prenatal Care Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>© ${new Date().getFullYear()} Prenatal Care System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendAppointmentReminderEmail(params: {
  to: string
  firstName: string
  lastName: string
  appointmentType: string
  appointmentDate: Date
  durationMinutes: number
  notes?: string | null
}) {
  const { to, firstName, lastName, appointmentType, appointmentDate, durationMinutes, notes } = params

  return sendEmail({
    to,
    subject: "Appointment Reminder - Tomorrow",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; font-size: 16px; opacity: 0.9; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .appointment-details { background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #64748b; }
            .value { color: #0f172a; }
            .note-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .info-box { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; padding: 30px 20px; color: #718096; font-size: 14px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Reminder</h1>
              <p>You have an appointment tomorrow</p>
            </div>
            <div class="content">
              <p>Dear ${firstName} ${lastName},</p>
              <p>This is a friendly reminder about your upcoming appointment tomorrow.</p>

              <div class="appointment-details">
                <h2 style="margin-top: 0; color: #0ea5e9;">Appointment Details</h2>
                <div class="detail-row">
                  <span class="label">Type:</span>
                  <span class="value" style="text-transform: capitalize;">${appointmentType}</span>
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
                  <span class="value">${durationMinutes} minutes</span>
                </div>
              </div>

              ${
                notes
                  ? `
                <div class="note-box">
                  <p style="margin: 0;"><strong>Note:</strong> ${notes}</p>
                </div>
              `
                  : ""
              }

              <div class="info-box">
                <p style="margin: 0 0 10px 0;"><strong>📋 Reminder:</strong></p>
                <ul style="margin: 0; color: #065f46;">
                  <li>Please arrive 10 minutes early for check-in</li>
                  <li>Bring any relevant medical documents or test results</li>
                  <li>If you need to reschedule or cancel, please contact us as soon as possible</li>
                </ul>
              </div>

              <p>We look forward to seeing you!</p>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Your Prenatal Care Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated reminder. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Prenatal Care System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendAppointmentCreatedEmail(params: {
  to: string
  firstName: string
  lastName: string
  appointmentType: string
  appointmentDate: Date
  durationMinutes: number
  notes?: string | null
}) {
  const { to, firstName, lastName, appointmentType, appointmentDate, durationMinutes, notes } = params

  return sendEmail({
    to,
    subject: "New Appointment Scheduled",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .appointment-details { background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #64748b; }
            .value { color: #0f172a; }
            .footer { text-align: center; padding: 30px 20px; color: #718096; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Scheduled</h1>
              <p>Your appointment has been confirmed</p>
            </div>
            <div class="content">
              <p>Dear ${firstName} ${lastName},</p>
              <p>A new appointment has been scheduled for you.</p>

              <div class="appointment-details">
                <h2 style="margin-top: 0; color: #10b981;">Appointment Details</h2>
                <div class="detail-row">
                  <span class="label">Type:</span>
                  <span class="value" style="text-transform: capitalize;">${appointmentType}</span>
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
                  <span class="value">${durationMinutes} minutes</span>
                </div>
              </div>

              ${
                notes
                  ? `
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0;"><strong>Note:</strong> ${notes}</p>
                </div>
              `
                  : ""
              }

              <p>Please mark your calendar and arrive 10 minutes early.</p>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Your Prenatal Care Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Prenatal Care System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendTestEmail(to: string = "test@example.com") {
  return sendEmail({
    to,
    subject: "Test Email - Prenatal Care System",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .info-box { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; padding: 30px 20px; color: #718096; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Configuration Test</h1>
              <p>System Check Successful</p>
            </div>
            <div class="content">
              <p>Congratulations! Your email system is configured correctly.</p>
              
              <div class="info-box">
                <p style="margin: 0 0 10px 0;"><strong>This test confirms:</strong></p>
                <ul style="margin: 0; color: #065f46;">
                  <li>Brevo API key is valid</li>
                  <li>Email sending is working</li>
                  <li>HTML templates are rendering properly</li>
                </ul>
              </div>

              <p>You can now send appointment reminders and patient notifications.</p>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Your Prenatal Care Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>This is a test email. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Prenatal Care System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(params: {
  to: string
  firstName: string
  resetLink: string
}) {
  const { to, firstName, resetLink } = params

  return sendEmail({
    to,
    subject: "Reset Your Password - Prenatal Care Portal",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; font-size: 16px; opacity: 0.9; }
            .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .warning-box h3 { margin-top: 0; color: #92400e; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; margin: 30px 0; text-align: center; }
            .cta-button:hover { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); }
            .info-box { background: #f8fafc; border-left: 4px solid #64748b; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 30px 20px; color: #718096; font-size: 14px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
              <p>Reset Your Account Password</p>
            </div>
            <div class="content">
              <p>Dear ${firstName},</p>
              <p>We received a request to reset your password for your Prenatal Care Portal account.</p>
              
              <div class="warning-box">
                <h3>⚠️ Security Notice</h3>
                <p style="margin-bottom: 0;">If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
              </div>

              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="cta-button">Reset My Password</a>
              </div>

              <div class="info-box">
                <p style="margin: 0 0 10px 0;"><strong>Important:</strong></p>
                <ul style="margin: 0; color: #475569;">
                  <li>This link will expire in 1 hour for security reasons</li>
                  <li>You'll be asked to create a new password</li>
                  <li>Use a strong password that you don't use elsewhere</li>
                </ul>
              </div>

              <p style="margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #64748b; font-size: 12px;">${resetLink}</p>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Your Prenatal Care Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>© ${new Date().getFullYear()} Prenatal Care System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}
