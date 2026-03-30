import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddAppointmentDialog } from "@/components/add-appointment-dialog"
import { RescheduleRequestActions } from "@/components/reschedule-request-actions"
import { Calendar, Clock, User } from "lucide-react"

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      patients (first_name, last_name, phone)
    `,
    )
    .in("status", ["scheduled", "confirmed"])
    .gte("appointment_date", today.toISOString())
    .order("appointment_date", { ascending: true })

  const { data: pastAppointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      patients (first_name, last_name, phone)
    `,
    )
    .lt("appointment_date", today.toISOString())
    .order("appointment_date", { ascending: false })
    .limit(20)

  const { data: rescheduleRequests } = await supabase
    .from("appointment_reschedule_requests")
    .select(
      `
      id,
      status,
      preferred_datetime,
      proposed_datetime,
      patient_notes,
      doctor_notes,
      appointments (
        appointment_date,
        appointment_type,
        patients (first_name, last_name)
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const todayAppointments = upcomingAppointments?.filter((apt) => {
    const aptDate = new Date(apt.appointment_date)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() === today.getTime()
  })

  const futureAppointments = upcomingAppointments?.filter((apt) => {
    const aptDate = new Date(apt.appointment_date)
    aptDate.setHours(0, 0, 0, 0)
    return aptDate.getTime() > today.getTime()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "confirmed":
        return "secondary"
      case "scheduled":
        return "outline"
      case "cancelled":
        return "destructive"
      case "no-show":
        return "destructive"
      default:
        return "outline"
    }
  }

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {appointment.patients?.first_name} {appointment.patients?.last_name}
            </CardTitle>
            <CardDescription className="capitalize">{appointment.appointment_type}</CardDescription>
          </div>
          <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {new Date(appointment.appointment_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
            {appointment.duration_minutes} min)
          </span>
        </div>
        {appointment.notes && (
          <div className="mt-3 rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const pendingRequests = rescheduleRequests ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage your appointment schedule</p>
        </div>
        <AddAppointmentDialog />
      </div>

      {pendingRequests.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Pending Reschedule Requests</span>
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            </CardTitle>
            <CardDescription>Review patient reschedule requests and respond with a new time or approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request: any) => (
              <RescheduleRequestActions key={request.id} request={request} />
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today ({todayAppointments?.length || 0})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({futureAppointments?.length || 0})</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayAppointments && todayAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {futureAppointments && futureAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {futureAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments && pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No past appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
