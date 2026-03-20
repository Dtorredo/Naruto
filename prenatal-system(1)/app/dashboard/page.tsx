import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, TrendingUp, Users } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard-charts"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch user profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Fetch statistics
  const { count: totalPatients } = await supabase.from("patients").select("*", { count: "exact", head: true })

  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("appointment_date", new Date().toISOString())

  const { count: activePregnancies } = await supabase
    .from("prenatal_records")
    .select("*", { count: "exact", head: true })
    .eq("pregnancy_status", "active")

  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("appointment_date", new Date().toISOString().split("T")[0])
    .lt("appointment_date", new Date(Date.now() + 86400000).toISOString().split("T")[0])

  // Fetch recent appointments
  const { data: recentAppointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      patients (first_name, last_name)
    `,
    )
    .order("appointment_date", { ascending: true })
    .limit(5)

  // Mock data for charts (in production, this would come from actual data)
  const appointmentData = [
    { month: "Jan", appointments: 45 },
    { month: "Feb", appointments: 52 },
    { month: "Mar", appointments: 48 },
    { month: "Apr", appointments: 61 },
    { month: "May", appointments: 55 },
    { month: "Jun", appointments: 67 },
  ]

  const patientGrowthData = [
    { month: "Jan", patients: 120 },
    { month: "Feb", patients: 135 },
    { month: "Mar", patients: 148 },
    { month: "Apr", patients: 162 },
    { month: "May", patients: 178 },
    { month: "Jun", patients: 195 },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.full_name || "Doctor"}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your practice today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pregnancies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePregnancies || 0}</div>
            <p className="text-xs text-muted-foreground">Currently monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts appointmentData={appointmentData} patientGrowthData={patientGrowthData} />

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your next scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAppointments && recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {appointment.patients?.first_name} {appointment.patients?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{appointment.appointment_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.appointment_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
