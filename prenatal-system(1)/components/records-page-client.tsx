"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { EditPrenatalRecordDialog } from "@/components/edit-prenatal-record-dialog"
import { EditCheckupRecordDialog } from "@/components/edit-checkup-record-dialog"
import { Activity, Calendar, FileText, Heart, TrendingUp, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type PrenatalRecord = {
  id: string
  patient_id: string
  lmp_date: string
  edd_date: string
  gravida: number
  para: number
  current_week: number
  current_trimester: number
  pregnancy_status: string
  notes: string | null
  patients?: {
    first_name: string
    last_name: string
  }
}

type CheckupRecord = {
  id: string
  appointment_id: string
  patient_id: string
  weight_kg: number | null
  blood_pressure: string | null
  fundal_height_cm: number | null
  fetal_heart_rate: number | null
  urine_test_results: string | null
  blood_test_results: string | null
  ultrasound_notes: string | null
  complaints: string | null
  diagnosis: string | null
  recommendations: string | null
  next_visit_date: string | null
  patients?: {
    first_name: string
    last_name: string
  }
  appointments?: {
    appointment_date: string
    appointment_type: string
  }
}

type RecordsPageClientProps = {
  prenatalRecords: PrenatalRecord[]
  checkupRecords: CheckupRecord[]
  activePregnanciesCount: number
}

export function RecordsPageClient({
  prenatalRecords,
  checkupRecords,
  activePregnanciesCount,
}: RecordsPageClientProps) {
  const [editingPrenatalRecord, setEditingPrenatalRecord] = useState<PrenatalRecord | null>(null)
  const [editingCheckupRecord, setEditingCheckupRecord] = useState<CheckupRecord | null>(null)
  const [deletingPrenatalRecord, setDeletingPrenatalRecord] = useState<PrenatalRecord | null>(null)
  const [deletingCheckupRecord, setDeletingCheckupRecord] = useState<CheckupRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeletePrenatalRecord = async () => {
    if (!deletingPrenatalRecord) return

    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("prenatal_records")
      .delete()
      .eq("id", deletingPrenatalRecord.id)

    setIsDeleting(false)

    if (!error) {
      toast({
        title: "Record deleted",
        description: "The prenatal record has been deleted.",
      })
      setDeletingPrenatalRecord(null)
      router.refresh()
    } else {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteCheckupRecord = async () => {
    if (!deletingCheckupRecord) return

    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("checkup_records")
      .delete()
      .eq("id", deletingCheckupRecord.id)

    setIsDeleting(false)

    if (!error) {
      toast({
        title: "Record deleted",
        description: "The checkup record has been deleted.",
      })
      setDeletingCheckupRecord(null)
      router.refresh()
    } else {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="prenatal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prenatal">Prenatal Records ({activePregnanciesCount} Active)</TabsTrigger>
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
                      <div className="flex items-center gap-2">
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingPrenatalRecord(record)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => setDeletingPrenatalRecord(record)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
                          {record.appointments?.appointment_date
                            ? `${new Date(record.appointments.appointment_date).toLocaleDateString()} - ${record.appointments.appointment_type}`
                            : "No appointment linked"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingCheckupRecord(record)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => setDeletingCheckupRecord(record)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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

      <EditPrenatalRecordDialog
        open={!!editingPrenatalRecord}
        onOpenChange={(open) => !open && setEditingPrenatalRecord(null)}
        record={editingPrenatalRecord}
      />

      <EditCheckupRecordDialog
        open={!!editingCheckupRecord}
        onOpenChange={(open) => !open && setEditingCheckupRecord(null)}
        record={editingCheckupRecord}
      />

      <AlertDialog open={!!deletingPrenatalRecord} onOpenChange={(open) => !open && setDeletingPrenatalRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prenatal Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the prenatal record for {deletingPrenatalRecord?.patients?.first_name}{" "}
              {deletingPrenatalRecord?.patients?.last_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrenatalRecord}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingCheckupRecord} onOpenChange={(open) => !open && setDeletingCheckupRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checkup Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the checkup record for {deletingCheckupRecord?.patients?.first_name}{" "}
              {deletingCheckupRecord?.patients?.last_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCheckupRecord}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
