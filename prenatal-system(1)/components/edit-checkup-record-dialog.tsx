"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

type EditCheckupRecordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: {
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
  } | null
}

export function EditCheckupRecordDialog({ open, onOpenChange, record }: EditCheckupRecordDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!record) return

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("checkup_records")
      .update({
        weight_kg: formData.get("weight") ? Number.parseFloat(formData.get("weight") as string) : null,
        blood_pressure: (formData.get("bloodPressure") as string) || null,
        fundal_height_cm: formData.get("fundalHeight")
          ? Number.parseFloat(formData.get("fundalHeight") as string)
          : null,
        fetal_heart_rate: formData.get("fetalHeartRate")
          ? Number.parseInt(formData.get("fetalHeartRate") as string)
          : null,
        urine_test_results: (formData.get("urineTest") as string) || null,
        blood_test_results: (formData.get("bloodTest") as string) || null,
        ultrasound_notes: (formData.get("ultrasoundNotes") as string) || null,
        complaints: (formData.get("complaints") as string) || null,
        diagnosis: (formData.get("diagnosis") as string) || null,
        recommendations: (formData.get("recommendations") as string) || null,
        next_visit_date: (formData.get("nextVisit") as string) || null,
        performed_by: user?.id,
      })
      .eq("id", record.id)

    setIsLoading(false)

    if (!error) {
      toast({
        title: "Record updated",
        description: "The checkup record has been successfully updated.",
      })
      onOpenChange(false)
      router.refresh()
    } else {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Checkup Record</DialogTitle>
          <DialogDescription>Update the checkup information for this patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                defaultValue={record.weight_kg || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodPressure">Blood Pressure</Label>
              <Input
                id="bloodPressure"
                name="bloodPressure"
                placeholder="120/80"
                defaultValue={record.blood_pressure || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundalHeight">Fundal Height (cm)</Label>
              <Input
                id="fundalHeight"
                name="fundalHeight"
                type="number"
                step="0.1"
                defaultValue={record.fundal_height_cm || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fetalHeartRate">Fetal Heart Rate (bpm)</Label>
            <Input
              id="fetalHeartRate"
              name="fetalHeartRate"
              type="number"
              defaultValue={record.fetal_heart_rate || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="urineTest">Urine Test Results</Label>
              <Textarea
                id="urineTest"
                name="urineTest"
                defaultValue={record.urine_test_results || ""}
                placeholder="Test results"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodTest">Blood Test Results</Label>
              <Textarea
                id="bloodTest"
                name="bloodTest"
                defaultValue={record.blood_test_results || ""}
                placeholder="Test results"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ultrasoundNotes">Ultrasound Notes</Label>
            <Textarea
              id="ultrasoundNotes"
              name="ultrasoundNotes"
              defaultValue={record.ultrasound_notes || ""}
              placeholder="Ultrasound findings"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaints">Patient Complaints</Label>
            <Textarea
              id="complaints"
              name="complaints"
              defaultValue={record.complaints || ""}
              placeholder="Any complaints or concerns"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              defaultValue={record.diagnosis || ""}
              placeholder="Medical diagnosis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              id="recommendations"
              name="recommendations"
              defaultValue={record.recommendations || ""}
              placeholder="Treatment recommendations"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextVisit">Next Visit Date</Label>
            <Input
              id="nextVisit"
              name="nextVisit"
              type="date"
              defaultValue={record.next_visit_date?.split("T")[0] || ""}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
