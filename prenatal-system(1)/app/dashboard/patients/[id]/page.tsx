import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Mail, Phone, MapPin, Droplet, AlertCircle, FileText, Activity, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PrescriptionPDFButton } from "@/components/prescription-pdf-button"
import { PatientActionButtons } from "@/components/patient-action-buttons"

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).single()

  if (!patient) {
    notFound()
  }

  const { data: prenatalRecords } = await supabase
    .from("prenatal_records")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", id)
    .order("appointment_date", { ascending: false })
    .limit(10)

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(
      `
      *,
      profiles:prescribed_by (
        full_name,
        specialization
      )
    `,
    )
    .eq("patient_id", id)
    .order("prescribed_date", { ascending: false })
    .limit(10)

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const activePregnancy = prenatalRecords?.find((record) => record.pregnancy_status === "active")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-muted-foreground">Patient Details</p>
          </div>
        </div>
        <PatientActionButtons
          patientId={patient.id}
          patientName={`${patient.first_name} ${patient.last_name}`}
          patientEmail={patient.email}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{calculateAge(patient.date_of_birth)} years</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">DOB:</span>
                <span className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</span>
              </div>
              {patient.blood_type && (
                <div className="flex items-center gap-2 text-sm">
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Blood Type:</span>
                  <Badge variant="secondary">{patient.blood_type}</Badge>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="break-all">{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{patient.address}</span>
                </div>
              )}
            </div>

            {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium">Emergency Contact</p>
                {patient.emergency_contact_name && <p className="text-sm">{patient.emergency_contact_name}</p>}
                {patient.emergency_contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {patient.emergency_contact_phone}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {activePregnancy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Current Pregnancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Trimester</p>
                    <p className="text-2xl font-bold">{activePregnancy.current_trimester}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Week</p>
                    <p className="text-2xl font-bold">{activePregnancy.current_week}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p className="text-lg font-semibold">{new Date(activePregnancy.edd_date).toLocaleDateString()}</p>
                  </div>
                </div>
                {activePregnancy.notes && (
                  <div className="mt-4 rounded-md bg-muted/50 p-3">
                    <p className="text-sm">{activePregnancy.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="medical" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medical">Medical Info</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.allergies ? (
                    <p className="text-sm leading-relaxed">{patient.allergies}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No known allergies</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.medical_history ? (
                    <p className="text-sm leading-relaxed">{patient.medical_history}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No medical history recorded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment History</CardTitle>
                  <CardDescription>Past and upcoming appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments && appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-medium capitalize">{appointment.appointment_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                              {new Date(appointment.appointment_date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
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
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No appointments found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions">
              <Card>
                <CardHeader>
                  <CardTitle>Prescription History</CardTitle>
                  <CardDescription>Medications prescribed to this patient</CardDescription>
                </CardHeader>
                <CardContent>
                  {prescriptions && prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map((prescription: any) => (
                        <div key={prescription.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{prescription.medication_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {prescription.dosage} - {prescription.frequency}
                              </p>
                              <p className="text-sm text-muted-foreground">Duration: {prescription.duration}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="text-sm text-muted-foreground">
                                {new Date(prescription.prescribed_date).toLocaleDateString()}
                              </p>
                              <PrescriptionPDFButton
                                prescription={prescription}
                                patient={{
                                  first_name: patient.first_name,
                                  last_name: patient.last_name,
                                  date_of_birth: patient.date_of_birth,
                                  blood_type: patient.blood_type,
                                  address: patient.address,
                                }}
                                doctor={{
                                  full_name: prescription.profiles?.full_name || "Unknown Doctor",
                                  specialization: prescription.profiles?.specialization || null,
                                }}
                              />
                            </div>
                          </div>
                          {prescription.instructions && (
                            <p className="mt-2 text-sm text-muted-foreground">{prescription.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No prescriptions found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
