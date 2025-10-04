import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Activity, Pill } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrescriptionPDFButton } from "@/components/prescription-pdf-button"

export default async function PatientRecordsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: patient } = await supabase.from("patients").select("*").eq("user_id", user?.id).single()

  if (!patient) {
    return <div>No patient record found</div>
  }

  const { data: prenatalRecords } = await supabase
    .from("prenatal_records")
    .select("*")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })

  const { data: checkupRecords } = await supabase
    .from("checkup_records")
    .select("*")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })

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
    .eq("patient_id", patient.id)
    .order("prescribed_date", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
        <p className="text-muted-foreground">View your prenatal records, checkups, and prescriptions</p>
      </div>

      <Tabs defaultValue="prenatal" className="w-full">
        <TabsList>
          <TabsTrigger value="prenatal">Prenatal Records</TabsTrigger>
          <TabsTrigger value="checkups">Checkups</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="prenatal" className="space-y-4">
          {prenatalRecords && prenatalRecords.length > 0 ? (
            prenatalRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Prenatal Record
                      </CardTitle>
                      <CardDescription>Created {new Date(record.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        record.pregnancy_status === "active"
                          ? "default"
                          : record.pregnancy_status === "completed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {record.pregnancy_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Trimester</p>
                      <p className="text-2xl font-bold">{record.current_trimester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Week</p>
                      <p className="text-2xl font-bold">{record.current_week}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Delivery</p>
                      <p className="text-lg font-semibold">{new Date(record.edd_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-4 p-3 rounded-md bg-muted/50">
                      <p className="text-sm">{record.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No prenatal records found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checkups" className="space-y-4">
          {checkupRecords && checkupRecords.length > 0 ? (
            checkupRecords.map((checkup) => (
              <Card key={checkup.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Checkup Record
                  </CardTitle>
                  <CardDescription>{new Date(checkup.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {checkup.weight_kg && (
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-medium">{checkup.weight_kg} kg</p>
                      </div>
                    )}
                    {checkup.blood_pressure && (
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                        <p className="font-medium">{checkup.blood_pressure}</p>
                      </div>
                    )}
                    {checkup.fundal_height_cm && (
                      <div>
                        <p className="text-sm text-muted-foreground">Fundal Height</p>
                        <p className="font-medium">{checkup.fundal_height_cm} cm</p>
                      </div>
                    )}
                    {checkup.fetal_heart_rate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Fetal Heart Rate</p>
                        <p className="font-medium">{checkup.fetal_heart_rate} bpm</p>
                      </div>
                    )}
                  </div>
                  {checkup.diagnosis && (
                    <div>
                      <p className="text-sm font-medium mb-1">Diagnosis</p>
                      <p className="text-sm text-muted-foreground">{checkup.diagnosis}</p>
                    </div>
                  )}
                  {checkup.recommendations && (
                    <div>
                      <p className="text-sm font-medium mb-1">Recommendations</p>
                      <p className="text-sm text-muted-foreground">{checkup.recommendations}</p>
                    </div>
                  )}
                  {checkup.next_visit_date && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Next Visit: {new Date(checkup.next_visit_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No checkup records found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          {prescriptions && prescriptions.length > 0 ? (
            prescriptions.map((prescription: any) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        {prescription.medication_name}
                      </CardTitle>
                      <CardDescription>
                        Prescribed on {new Date(prescription.prescribed_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
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
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Dosage</p>
                      <p className="font-medium">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-medium">{prescription.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{prescription.duration}</p>
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div className="mt-3 p-3 rounded-md bg-muted/50">
                      <p className="text-sm font-medium mb-1">Instructions</p>
                      <p className="text-sm">{prescription.instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No prescriptions found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
