import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Activity, FileText, Clock } from "lucide-react"

export default async function PatientPortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get patient record linked to this user
  const { data: patient } = await supabase.from("patients").select("*").eq("user_id", user?.id).single()

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Patient Record Pending</CardTitle>
            <CardDescription>
              Your account hasn&apos;t been linked to a patient record yet. A clinic staff member will complete this step.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Get active pregnancy
  const { data: activePregnancy } = await supabase
    .from("prenatal_records")
    .select("*")
    .eq("patient_id", patient.id)
    .eq("pregnancy_status", "active")
    .single()

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patient.id)
    .in("status", ["scheduled", "confirmed"])
    .gte("appointment_date", new Date().toISOString())
    .order("appointment_date", { ascending: true })
    .limit(5)

  // Get recent checkups
  const { data: recentCheckups } = await supabase
    .from("checkup_records")
    .select("*")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {patient.first_name} {patient.last_name}
        </h1>
        <p className="text-muted-foreground">Your prenatal care overview</p>
      </div>

      {activePregnancy && (
        <Card className="border-sky-200 bg-sky-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-600" />
              Current Pregnancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Trimester</p>
                <p className="text-3xl font-bold text-sky-600">{activePregnancy.current_trimester}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Week</p>
                <p className="text-3xl font-bold text-sky-600">{activePregnancy.current_week}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Delivery</p>
                <p className="text-lg font-semibold">{new Date(activePregnancy.edd_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your scheduled visits</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium capitalize">{appointment.appointment_type}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                        {new Date(appointment.appointment_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <Badge variant="secondary">{appointment.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Checkups
            </CardTitle>
            <CardDescription>Your latest medical records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckups && recentCheckups.length > 0 ? (
              <div className="space-y-4">
                {recentCheckups.map((checkup) => (
                  <div key={checkup.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Checkup Record</p>
                        {checkup.weight_kg && (
                          <p className="text-sm text-muted-foreground">Weight: {checkup.weight_kg} kg</p>
                        )}
                        {checkup.blood_pressure && (
                          <p className="text-sm text-muted-foreground">BP: {checkup.blood_pressure}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(checkup.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No checkup records yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
