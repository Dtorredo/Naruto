# Email System Documentation

## Overview

This system uses **Resend** as the email service provider to send various transactional emails for the prenatal care system.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
RESEND_API_KEY=re_873Rexx6_BRwVVEYN6jLCm8nukBGNL47a
CRON_SECRET=your-secure-cron-secret-key-here
```

### Email Domain

Currently using: `onboarding@resend.dev` (Resend's sandbox domain)

To use a custom domain:
1. Add your domain in Resend dashboard
2. Verify DNS records (MX, TXT, etc.)
3. Update `EMAIL_FROM` in `/lib/email.ts`

## Email Types

### 1. Welcome Email (New Patient Invite)

**Triggered when:** Staff adds a new patient via "Add Patient" dialog

**API Route:** `POST /api/invite-patient`

**Email Function:** `sendWelcomeEmail()`

**Features:**
- Personalized greeting with patient name
- Call-to-action button to set up password
- Overview of portal features
- Link to password setup page

### 2. Resend Invite Email

**Triggered when:** Staff clicks "Resend Invite" button

**API Route:** `POST /api/patients/[id]/resend-invite`

**Behavior:**
- If patient has no `user_id`: Creates user and sends welcome email
- If patient has `user_id`: Sends password reset email via Supabase

### 3. Appointment Reminder (24 hours before)

**Triggered by:** Cron job (scheduled)

**API Route:** `GET /api/send-reminders`

**Email Function:** `sendAppointmentReminderEmail()`

**Features:**
- Appointment type, date, time, and duration
- Any notes from the appointment
- Reminder to arrive 10 minutes early
- Styled appointment details card

**Cron Configuration (Fly.io example):**
```toml
# fly.toml
[[services]]
  schedule = "0 9 * * *"  # Daily at 9 AM
  path = "/api/send-reminders"
  headers = { Authorization = "Bearer ${CRON_SECRET}" }
```

### 4. New Appointment Notification

**Triggered when:** Staff creates a new appointment

**API Route:** `POST /api/notify-appointment`

**Email Function:** `sendAppointmentCreatedEmail()`

**Usage:**
```typescript
// After creating appointment
await fetch('/api/notify-appointment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appointmentId: 'uuid-here' })
})
```

### 5. Test Email

**Triggered by:** Cron job or manual testing

**API Route:** `GET /api/test-email`

**Email Function:** `sendTestEmail()`

**Testing:**
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/test-email
```

## File Structure

```
lib/
  email.ts                      # Centralized email functions
app/api/
  invite-patient/route.ts       # Patient invite with welcome email
  patients/[id]/resend-invite/  # Resend invite logic
  send-reminders/route.tsx      # Cron job for appointment reminders
  notify-appointment/route.ts   # New appointment notification
  test-email/route.tsx          # Test email endpoint
```

## Email Templates

All templates are inline HTML in `/lib/email.ts`. Each includes:
- Responsive design
- Branded gradient headers
- Styled content sections
- Footer with copyright

### Available Functions

```typescript
// Send welcome email to new patient
sendWelcomeEmail({
  to: string
  firstName: string
  lastName: string
  passwordSetupLink: string
})

// Send appointment reminder (24h before)
sendAppointmentReminderEmail({
  to: string
  firstName: string
  lastName: string
  appointmentType: string
  appointmentDate: Date
  durationMinutes: number
  notes?: string | null
})

// Send notification when appointment is created
sendAppointmentCreatedEmail({
  to: string
  firstName: string
  lastName: string
  appointmentType: string
  appointmentDate: Date
  durationMinutes: number
  notes?: string | null
})

// Send test email
sendTestEmail(to?: string) // defaults to delivered@resend.dev
```

## Security

### Cron Job Protection

All cron-protected endpoints require:
```
Authorization: Bearer ${CRON_SECRET}
```

### API Key Security

- `RESEND_API_KEY` should never be exposed to client-side code
- Only server-side routes should use the Resend SDK
- The key in `.env` is for development; production should use secrets management

## Testing

### Local Testing

1. Ensure `RESEND_API_KEY` is in `.env`
2. Start dev server: `npm run dev`
3. Test email endpoint:
   ```bash
   curl -H "Authorization: Bearer your-cron-secret" \
     http://localhost:3000/api/test-email
   ```

### Production Testing

1. Set secrets in Fly.io:
   ```bash
   fly secrets set RESEND_API_KEY=re_xxx
   fly secrets set CRON_SECRET=your-secret
   ```
2. Deploy and test

## Troubleshooting

### Email Not Sending

1. Check `RESEND_API_KEY` is valid
2. Verify Resend dashboard for delivery status
3. Check server logs for errors
4. Ensure patient has valid email address

### Emails Going to Spam

1. Verify custom domain in Resend
2. Set up SPF, DKIM, DMARC records
3. Monitor sender reputation in Resend dashboard

### Cron Job Not Running

1. Verify `CRON_SECRET` matches
2. Check cron schedule syntax
3. Review Fly.io cron job logs

## Future Enhancements

- [ ] Email templates using React Email components
- [ ] Appointment reschedule notifications
- [ ] Prescription ready notifications
- [ ] Lab results available notifications
- [ ] Custom domain email verification
- [ ] Email delivery tracking in database
- [ ] Unsubscribe functionality
- [ ] Email preferences per patient
