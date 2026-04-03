# Email System Migration Summary

## ✅ Completed Changes

### 1. Resend Integration
- **Added Resend API key** to `.env` file
- **Added CRON_SECRET** for protecting cron endpoints
- **Created centralized email utility** at `/lib/email.ts`

### 2. Email Functions Created

All email functions are now in `/lib/email.ts`:

#### `sendWelcomeEmail()`
- Sent when new patient is added via "Add Patient" dialog
- Beautiful purple gradient design
- Includes password setup link
- Lists portal features

#### `sendAppointmentReminderEmail()`
- Sent 24 hours before appointment (via cron job)
- Blue gradient design
- Shows appointment details in styled card
- Includes reminders and instructions

#### `sendAppointmentCreatedEmail()`
- Sent immediately when appointment is created
- Green gradient design
- Notifies patient of new appointment
- **NEW API endpoint:** `POST /api/notify-appointment`

#### `sendTestEmail()`
- For testing email configuration
- Confirms Resend setup is working

### 3. Updated API Routes

#### `/api/invite-patient`
- ✅ Now uses `createUser` instead of `inviteUserByEmail`
- ✅ Sends welcome email via Resend
- ✅ Better error handling

#### `/api/patients/[id]/resend-invite`
- ✅ Checks if patient has `user_id`
- ✅ If exists: resends welcome email
- ✅ If not: creates user and sends welcome email
- ✅ Better error messages

#### `/api/send-reminders`
- ✅ Refactored to use centralized email function
- ✅ Removed duplicate HTML template
- ✅ Cleaner code

#### `/api/test-email`
- ✅ Refactored to use centralized email function
- ✅ Simpler implementation

#### `/api/notify-appointment` (NEW)
- ✅ Sends email when appointment is created
- ✅ Accepts `appointmentId` in request body
- ✅ Returns success/failure status

### 4. Email Configuration

**From Address:** `Prenatal Care <onboarding@resend.dev>`

This uses Resend's sandbox domain. To use your own domain:
1. Go to Resend dashboard → Domains
2. Add your domain
3. Add DNS records (SPF, DKIM, DMARC)
4. Update `EMAIL_FROM` in `/lib/email.ts`

## 📋 How to Use

### Adding New Patient (Sends Welcome Email)
```typescript
// Just call the existing endpoint
POST /api/invite-patient
Body: {
  firstName, lastName, dateOfBirth, email, phone, ...
}
// Welcome email is sent automatically
```

### Resending Invite
```typescript
POST /api/patients/{patientId}/resend-invite
// Resends welcome email or creates user if missing
```

### Notifying Patient of New Appointment
```typescript
POST /api/notify-appointment
Body: {
  appointmentId: "uuid-here"
}
// Email sent to patient with appointment details
```

### Appointment Reminders (Cron Job)
```bash
# Set up cron job to call this daily
GET /api/send-reminders
Headers: { Authorization: "Bearer ${CRON_SECRET}" }
# Finds appointments 24h away and sends reminders
```

### Testing Email Setup
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/test-email
```

## 🔒 Security

- ✅ `RESEND_API_KEY` only used server-side
- ✅ Cron endpoints protected with `CRON_SECRET`
- ✅ No email addresses exposed in logs
- ✅ Error handling prevents leaking sensitive info

## 📧 Email Templates

All templates feature:
- ✅ Responsive design
- ✅ Professional gradient headers
- ✅ Styled content sections
- ✅ Clear call-to-action buttons
- ✅ Footer with copyright
- ✅ Mobile-friendly

### Template Colors
- **Welcome Email:** Purple gradient (#667eea → #764ba2)
- **Appointment Reminder:** Blue gradient (#0ea5e9 → #0284c7)
- **New Appointment:** Green gradient (#10b981 → #059669)
- **Test Email:** Blue gradient (#0ea5e9 → #0284c7)

## 🚀 Deployment

### Environment Variables to Set
```bash
# For Fly.io
fly secrets set RESEND_API_KEY=re_873Rexx6_BRwVVEYN6jLCm8nukBGNL47a
fly secrets set CRON_SECRET=change-this-to-a-secure-random-string
```

### Cron Job Setup (Fly.io Example)

Add to `fly.toml`:
```toml
[[services]]
  schedule = "0 9 * * *"  # Daily at 9 AM UTC
  path = "/api/send-reminders"
  headers = { Authorization = "Bearer ${CRON_SECRET}" }
```

Or use external cron service (Cron-job.org, EasyCron, etc.)

## 📊 Email Flow

```
New Patient Added
    ↓
POST /api/invite-patient
    ↓
Create Supabase User + Patient Record
    ↓
Send Welcome Email via Resend
    ↓
Patient receives email with setup link


Appointment Created
    ↓
POST /api/notify-appointment (manual call)
    ↓
Send Appointment Notification Email
    ↓
Patient receives appointment details


24 Hours Before Appointment
    ↓
Cron: GET /api/send-reminders
    ↓
Find appointments 24h away
    ↓
Send reminder emails to all patients
```

## 🐛 Troubleshooting

### Email Not Received
1. Check Resend dashboard → Emails
2. Verify patient has valid email address
3. Check spam folder
4. Review server logs for errors

### Cron Job Not Working
1. Verify `CRON_SECRET` is set correctly
2. Check cron schedule syntax
3. Review logs for authentication errors

### Build Errors
- All type errors fixed
- Build completes successfully
- No runtime errors expected

## 📝 Next Steps (Optional)

1. **Integrate appointment notification** into your appointment creation flow
2. **Set up cron job** for daily reminders
3. **Add custom domain** to Resend for branded emails
4. **Track email delivery** in database
5. **Add email preferences** per patient
6. **Create React Email components** instead of raw HTML

## ✨ Benefits of This Setup

- ✅ **Centralized:** All email logic in one place
- ✅ **Maintainable:** Easy to update templates
- ✅ **Scalable:** Easy to add new email types
- ✅ **Professional:** Beautiful, consistent design
- ✅ **Reliable:** Using Resend's robust infrastructure
- ✅ **Secure:** API keys protected, cron endpoints secured
