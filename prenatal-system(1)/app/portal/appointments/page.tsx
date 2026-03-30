import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientRescheduleActions } from "@/components/patient-reschedule-actions"

export default async function PatientAppointmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user?.id).single()

  if (!patient) {
    return <div>No patient record found</div>
  }

  const now = new Date().toISOString()

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patient.id)
    .in("status", ["scheduled", "confirmed"])
    .gte("appointment_date", now)
    .order("appointment_date", { ascending: true })

  const { data: pastAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patient.id)
    .lt("appointment_date", now)
    .order("appointment_date", { ascending: false })

  const { data: rescheduleRequests } = await supabase
    .from("appointment_reschedule_requests")
    .select("*")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })

  const requestByAppointmentId = new Map(
    (rescheduleRequests ?? []).map((request) => [request.appointment_id, request]),
  )

  const AppointmentCard = ({ appointment, canRequestReschedule }: { appointment: any; canRequestReschedule: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="capitalize">{appointment.appointment_type}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4" />
              {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <Badge
            variant={
              appointment.status === "completed"
                ? "default"
                : appointment.status === "cancelled"
                  ? "destructive"
                  : "secondary"
            }
          >
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date(appointment.appointment_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          ({appointment.duration_minutes} minutes)
        </div>
        {appointment.notes && (
          <div className="mt-3 p-3 rounded-md bg-muted/50">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
        {canRequestReschedule && (
          <PatientRescheduleActions
            appointmentId={appointment.id}
            existingRequest={requestByAppointmentId.get(appointment.id)}
          />
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
        <p className="text-muted-foreground">View your scheduled and past appointments</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} canRequestReschedule />
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No upcoming appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments && pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} canRequestReschedule={false} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No past appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
