import { Button } from "@/components/ui/button"
import { Activity, Calendar, FileText, Users } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">PreNatal Care</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-balance text-foreground">Modern Prenatal Patient Management</h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-pretty text-muted-foreground leading-relaxed">
          Streamline your prenatal care practice with our comprehensive patient management system. Track appointments,
          medical records, and patient progress all in one secure platform.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Everything You Need for Prenatal Care</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Patient Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Comprehensive patient profiles with medical history, allergies, and emergency contacts
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Appointment Scheduling</h3>
            <p className="text-muted-foreground leading-relaxed">
              Easy-to-use calendar system for managing checkups, ultrasounds, and consultations
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Medical Records</h3>
            <p className="text-muted-foreground leading-relaxed">
              Track prenatal progress, checkup results, prescriptions, and vaccinations
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">Analytics Dashboard</h3>
            <p className="text-muted-foreground leading-relaxed">
              Real-time insights into patient statistics, appointments, and practice performance
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 PreNatal Care. Secure, HIPAA-compliant patient management.</p>
        </div>
      </footer>
    </div>
  )
}
