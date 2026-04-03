# Quick Start: Email System

## Test Your Email Setup

### 1. Start the dev server
```bash
npm run dev
```

### 2. Test email sending
Open another terminal and run:
```bash
curl -H "Authorization: Bearer your-cron-secret-key-here-change-in-production" \
  http://localhost:3000/api/test-email
```

You should get a response like:
```json
{
  "success": true,
  "messageId": "xxxxx-xxxxx-xxxxx"
}
```

### 3. Check your email
A test email will be sent to `delivered@resend.dev` (Resend's test inbox).
Check it at: https://resend.com/domains

## Add a New Patient (Triggers Welcome Email)

1. Go to Dashboard → Patients
2. Click "Add Patient"
3. Fill in the form (email is required)
4. Click "Add Patient"
5. Patient receives welcome email with password setup link

## Notify Patient of New Appointment

After creating an appointment, call:

```bash
curl -X POST http://localhost:3000/api/notify-appointment \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "YOUR-APPOINTMENT-ID"}'
```

Or from your code:
```typescript
await fetch('/api/notify-appointment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appointmentId: 'uuid-here' })
})
```

## Set Up Daily Appointment Reminders

### Option 1: Fly.io Cron Jobs
Add to `fly.toml`:
```toml
[[services]]
  schedule = "0 9 * * *"
  path = "/api/send-reminders"
  headers = { Authorization = "Bearer ${CRON_SECRET}" }
```

### Option 2: External Cron Service
Use services like:
- https://cron-job.org (free)
- https://www.easycron.com
- GitHub Actions with scheduled workflows

Configure to call:
```
GET https://your-app.fly.dev/api/send-reminders
Authorization: Bearer your-cron-secret
```

### Option 3: Manual Testing
```bash
curl -H "Authorization: Bearer your-cron-secret-key-here-change-in-production" \
  http://localhost:3000/api/send-reminders
```

## Environment Variables

Make sure these are in your `.env` file:

```env
RESEND_API_KEY=re_873Rexx6_BRwVVEYN6jLCm8nukBGNL47a
CRON_SECRET=your-cron-secret-key-here-change-in-production
```

## Common Issues

### "Unauthorized" error
- Make sure `CRON_SECRET` in request matches `.env`

### Email not sending
- Check Resend dashboard at https://resend.com/emails
- Verify `RESEND_API_KEY` is correct
- Check server console for errors

### Email goes to spam
- Set up custom domain in Resend
- Add SPF, DKIM, DMARC records
- See: EMAIL_SETUP.md for details

## Files to Know

- `/lib/email.ts` - All email templates and sending logic
- `/app/api/invite-patient/route.ts` - New patient welcome email
- `/app/api/send-reminders/route.tsx` - Daily appointment reminders
- `/app/api/notify-appointment/route.ts` - New appointment notification
- `/app/api/test-email/route.tsx` - Test email endpoint

## Need Help?

See detailed documentation:
- `EMAIL_SETUP.md` - Complete setup guide
- `EMAIL_MIGRATION.md` - Migration details and flow diagrams
