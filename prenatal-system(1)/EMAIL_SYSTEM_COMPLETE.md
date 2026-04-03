# Complete Email System Overview

## 📧 All Emails Sent via Resend (100% Branded)

### ✅ 1. New Patient Welcome Email
**Trigger:** Staff adds new patient  
**Route:** `POST /api/invite-patient`  
**Template:** Purple gradient header  
**Content:** Welcome message + password setup link + portal features

### ✅ 2. Resend Patient Invite
**Trigger:** Staff clicks "Resend Invite"  
**Route:** `POST /api/patients/[id]/resend-invite`  
**Template:** Purple gradient header  
**Content:** Same as welcome email (re-sends if user exists, creates if not)

### ✅ 3. Forgot Password Reset
**Trigger:** User clicks "Forgot your password?" on login  
**Route:** `POST /api/forgot-password`  
**Page:** `/auth/forgot-password`  
**Template:** Orange/amber gradient header  
**Content:** Password reset link + security notice + expiration warning

### ✅ 4. New Appointment Notification
**Trigger:** Manual API call after creating appointment  
**Route:** `POST /api/notify-appointment`  
**Template:** Green gradient header  
**Content:** Appointment details + date/time + notes

### ✅ 5. Appointment Reminder (24h before)
**Trigger:** Cron job (daily)  
**Route:** `GET /api/send-reminders`  
**Template:** Blue gradient header  
**Content:** Reminder + appointment details + preparation tips

### ✅ 6. Test Email
**Trigger:** Manual test  
**Route:** `GET /api/test-email`  
**Template:** Blue gradient header  
**Content:** Configuration confirmation

---

## 🔐 Supabase Role

**Supabase handles:**
- ✅ User account creation & storage
- ✅ Password hashing & storage (never plain text)
- ✅ Patient records & medical data
- ✅ Appointments & schedules
- ✅ Session management & authentication
- ✅ Token generation for password resets

**Supabase does NOT handle:**
- ❌ Email sending (all via Resend now)
- ❌ Email templates
- ❌ Email delivery

---

## 💰 Cost Breakdown (FREE)

### Resend Free Tier
- **3,000 emails/month** (100/day limit)
- **Your estimated usage:** ~200-300/month
- **Cost:** $0/month ✅

### Typical Monthly Usage
| Email Type | Estimated Count |
|------------|----------------|
| New patient invites | 20-50 |
| Resend invites | 10-20 |
| Password resets | 10-20 |
| Appointment notifications | 50-100 |
| Appointment reminders | 100-200 |
| **Total** | **~190-390** |

**Well within free limit!** ✅

---

## 🔄 Complete User Flows

### New Patient Flow
```
1. Staff clicks "Add Patient" in dashboard
2. Fills form with email
3. Submits → POST /api/invite-patient
4. Supabase: Creates user account
5. Supabase: Saves patient record
6. Resend: Sends welcome email (purple template)
7. Patient receives email → clicks "Set Up Password"
8. Supabase: Handles password creation
9. Patient can now log in
```

### Forgot Password Flow
```
1. User clicks "Forgot your password?" on login page
2. Goes to /auth/forgot-password
3. Enters email → POST /api/forgot-password
4. System looks up user in Supabase
5. Resend: Sends reset email (orange template)
6. User clicks reset link
7. Goes to /auth/reset-password-complete
8. Supabase: Validates token & updates password
9. User can log in with new password
```

### Appointment Created Flow
```
1. Staff creates appointment in dashboard
2. After creation → POST /api/notify-appointment
3. Supabase: Saves appointment
4. Resend: Sends notification email (green template)
5. Patient receives appointment details
```

### Appointment Reminder Flow
```
1. Cron job triggers daily at 9 AM
2. GET /api/send-reminders
3. Supabase: Finds appointments 24h away
4. Resend: Sends reminder emails (blue template)
5. All patients with tomorrow's appointments get notified
```

---

## 📁 File Structure

```
lib/
  email.ts                          # All email functions (6 total)

app/api/
  invite-patient/route.ts           # New patient + welcome email
  forgot-password/route.ts          # Password reset via Resend ✨ NEW
  notify-appointment/route.ts       # New appointment notification
  send-reminders/route.tsx          # Daily cron reminders
  test-email/route.tsx              # Test endpoint
  patients/[id]/resend-invite/      # Resend invite

app/auth/
  login/page.tsx                    # Has "Forgot password?" link ✨ UPDATED
  forgot-password/page.tsx          # Reset request page ✨ NEW
  reset-password-complete/page.tsx  # Actual password reset
  set-password/page.tsx             # Initial password setup
```

---

## 🎨 Email Template Colors

| Email Type | Color | Gradient |
|------------|-------|----------|
| Welcome/Invite | Purple | #667eea → #764ba2 |
| Forgot Password | Orange/Amber | #f59e0b → #d97706 |
| New Appointment | Green | #10b981 → #059669 |
| Appointment Reminder | Blue | #0ea5e9 → #0284c7 |
| Test Email | Blue | #0ea5e9 → #0284c7 |

---

## 🚀 Deployment Checklist

### Environment Variables
```bash
fly secrets set RESEND_API_KEY=re_873Rexx6_BRwVVEYN6jLCm8nukBGNL47a
fly secrets set CRON_SECRET=your-secure-random-string
fly secrets set NEXT_PUBLIC_SUPABASE_URL=your-url
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Cron Job Setup
Set up daily cron to call:
```
GET https://your-app.fly.dev/api/send-reminders
Authorization: Bearer ${CRON_SECRET}
Schedule: 0 9 * * * (daily at 9 AM)
```

### Test Everything
```bash
# 1. Test email
curl -H "Authorization: Bearer your-cron-secret" \
  https://your-app.fly.dev/api/test-email

# 2. Forgot password (manual test in UI)
# Go to login page → click "Forgot your password?"

# 3. Add patient (manual test in UI)
# Dashboard → Patients → Add Patient
```

---

## ✨ Key Features

### Security
- ✅ Passwords hashed by Supabase (bcrypt)
- ✅ Reset tokens expire in 1 hour
- ✅ Don't reveal if email exists (prevents enumeration)
- ✅ CRON_SECRET protects automated endpoints
- ✅ API keys never exposed to client

### User Experience
- ✅ Beautiful, branded email templates
- ✅ Clear call-to-action buttons
- ✅ Mobile-responsive emails
- ✅ Helpful error messages
- ✅ Success confirmations

### Developer Experience
- ✅ Centralized email functions
- ✅ Easy to add new email types
- ✅ Consistent template structure
- ✅ Full documentation

---

## 🎯 Summary

**Before:** Mixed Supabase + Resend emails  
**Now:** 100% Resend for all emails, Supabase for all data

**Everything is:**
- ✅ Using Resend for email delivery
- ✅ Using Supabase for data/auth
- ✅ Within free tier limits
- ✅ Professionally branded
- ✅ Fully documented
- ✅ Build-tested and working

**Total Cost: $0/month** 🎉
