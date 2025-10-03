# PreNatal Care - Patient Management System

A modern, secure prenatal patient management system built with Next.js, Supabase, and TypeScript.

## Features

- **Authentication & Authorization**: Secure email/password authentication with role-based access
- **Patient Management**: Comprehensive patient profiles with medical history, allergies, and emergency contacts
- **Prenatal Records**: Track pregnancy progress with LMP, EDD, gravida, para, and trimester information
- **Appointment Scheduling**: Manage checkups, ultrasounds, consultations, and follow-ups
- **Medical Records**: Detailed checkup records with vital signs, test results, and recommendations
- **Prescriptions & Vaccinations**: Track medications and immunizations
- **Analytics Dashboard**: Real-time insights into practice performance and patient statistics

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository or download the ZIP file
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Set up environment variables in your Vercel project or create a `.env.local` file:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

4. Run the database migration scripts in the \`scripts\` folder through the v0 interface or Supabase SQL editor

5. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the environment variables in Vercel project settings
4. Deploy!

### Deploy to Fly.io

1. Install the Fly CLI:

\`\`\`bash
curl -L https://fly.io/install.sh | sh
\`\`\`

2. Login to Fly:

\`\`\`bash
fly auth login
\`\`\`

3. Create a new Fly app:

\`\`\`bash
fly launch
\`\`\`

4. Set environment variables:

\`\`\`bash
fly secrets set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
fly secrets set NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-app.fly.dev/dashboard
\`\`\`

5. Deploy:

\`\`\`bash
fly deploy
\`\`\`

## Database Schema

The system uses the following main tables:

- **profiles**: User profiles for doctors, nurses, and admins
- **patients**: Patient demographic and contact information
- **prenatal_records**: Pregnancy tracking information
- **appointments**: Appointment scheduling and management
- **checkup_records**: Detailed checkup examination records
- **prescriptions**: Medication prescriptions
- **vaccinations**: Immunization records

All tables are protected with Row Level Security (RLS) policies.

## Security

- All data is protected with Supabase Row Level Security (RLS)
- Authentication required for all dashboard routes
- Secure password hashing and session management
- HIPAA-compliant data handling practices

## License

MIT License - feel free to use this project for your practice!
