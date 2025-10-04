import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddPrenatalRecordDialog } from "@/components/add-prenatal-record-dialog"
import { AddCheckupDialog } from "@/components/add-checkup-dialog"
import { Activity, Calendar, FileText, Heart, TrendingUp } from "lucide-react"

export default async function RecordsPage() {
  const supabase = await createClient()

  const { data: prenatalRecords } = await supabase
    .from("prenatal_records")
    .select(
      `
      *,
      patients (first_name, last_name)
    `,
    )
    .order("created_at", { ascending: false })

  const { data: checkupRecords } = await supabase
    .from("checkup_records")
    .select(
      `
      *,
      patients (first_name, last_name),
      appointments (appointment_date, appointment_type)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(20)

  const activePregnancies = prenatalRecords?.filter((record) => record.pregnancy_status === "active")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground">Track prenatal records and checkup history</p>
        </div>
        <div className="flex gap-2">
          <AddPrenatalRecordDialog />
          <AddCheckupDialog />
        </div>
      </div>

      <Tabs defaultValue="prenatal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prenatal">Prenatal Records ({activePregnancies?.length || 0} Active)</TabsTrigger>
          <TabsTrigger value="checkups">Checkup Records</TabsTrigger>
        </TabsList>

        <TabsContent value="prenatal" className="space-y-4">
          {prenatalRecords && prenatalRecords.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {prenatalRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          {record.patients?.first_name} {record.patients?.last_name}
                        </CardTitle>
                        <CardDescription>
                          Week {record.current_week} - Trimester {record.current_trimester}
                        </CardDescription>
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
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">LMP Date:</span>
                        <span className="font-medium">{new Date(record.lmp_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">EDD:</span>
                        <span className="font-medium">{new Date(record.edd_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Gravida/Para:</span>
                        <span className="font-medium">
                          G{record.gravida} P{record.para}
                        </span>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No prenatal records found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checkups" className="space-y-4">
          {checkupRecords && checkupRecords.length > 0 ? (
            <div className="space-y-4">
              {checkupRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          {record.patients?.first_name} {record.patients?.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.appointments?.appointment_date).toLocaleDateString()} -{" "}
                          {record.appointments?.appointment_type}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      {record.weight_kg && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="text-lg font-semibold">{record.weight_kg} kg</p>
                        </div>
                      )}
                      {record.blood_pressure && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Blood Pressure</p>
                          <p className="text-lg font-semibold">{record.blood_pressure}</p>
                        </div>
                      )}
                      {record.fundal_height_cm && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Fundal Height</p>
                          <p className="text-lg font-semibold">{record.fundal_height_cm} cm</p>
                        </div>
                      )}
                      {record.fetal_heart_rate && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Fetal Heart Rate</p>
                          <p className="text-lg font-semibold">{record.fetal_heart_rate} bpm</p>
                        </div>
                      )}
                    </div>

                    {record.diagnosis && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Diagnosis</p>
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                      </div>
                    )}

                    {record.recommendations && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Recommendations</p>
                        <p className="text-sm text-muted-foreground">{record.recommendations}</p>
                      </div>
                    )}

                    {record.next_visit_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Next Visit:</span>
                        <span className="font-medium">{new Date(record.next_visit_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No checkup records found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
