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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

type EditPrenatalRecordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: {
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
  } | null
}

export function EditPrenatalRecordDialog({ open, onOpenChange, record }: EditPrenatalRecordDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchPatients = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("patients").select("id, first_name, last_name").order("first_name")
      if (data) setPatients(data)
    }
    if (open) fetchPatients()
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!record) return

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase
      .from("prenatal_records")
      .update({
        patient_id: formData.get("patient") as string,
        lmp_date: formData.get("lmpDate") as string,
        edd_date: formData.get("eddDate") as string,
        gravida: Number.parseInt(formData.get("gravida") as string),
        para: Number.parseInt(formData.get("para") as string),
        current_week: Number.parseInt(formData.get("currentWeek") as string),
        current_trimester: Number.parseInt(formData.get("currentTrimester") as string),
        pregnancy_status: formData.get("pregnancyStatus") as string,
        notes: (formData.get("notes") as string) || null,
      })
      .eq("id", record.id)

    setIsLoading(false)

    if (!error) {
      toast({
        title: "Record updated",
        description: "The prenatal record has been successfully updated.",
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Prenatal Record</DialogTitle>
          <DialogDescription>Update the pregnancy information for this patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select name="patient" defaultValue={record.patient_id} required>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lmpDate">Last Menstrual Period (LMP) *</Label>
              <Input
                id="lmpDate"
                name="lmpDate"
                type="date"
                defaultValue={record.lmp_date.split("T")[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eddDate">Expected Delivery Date (EDD) *</Label>
              <Input
                id="eddDate"
                name="eddDate"
                type="date"
                defaultValue={record.edd_date.split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gravida">Gravida (Total Pregnancies)</Label>
              <Input id="gravida" name="gravida" type="number" min="1" defaultValue={record.gravida} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="para">Para (Live Births)</Label>
              <Input id="para" name="para" type="number" min="0" defaultValue={record.para} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentWeek">Current Week *</Label>
              <Input
                id="currentWeek"
                name="currentWeek"
                type="number"
                min="1"
                max="42"
                defaultValue={record.current_week}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentTrimester">Current Trimester *</Label>
              <Select name="currentTrimester" defaultValue={String(record.current_trimester)} required>
                <SelectTrigger id="currentTrimester">
                  <SelectValue placeholder="Select trimester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First Trimester</SelectItem>
                  <SelectItem value="2">Second Trimester</SelectItem>
                  <SelectItem value="3">Third Trimester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pregnancyStatus">Pregnancy Status *</Label>
            <Select name="pregnancyStatus" defaultValue={record.pregnancy_status} required>
              <SelectTrigger id="pregnancyStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={record.notes || ""}
              placeholder="Additional notes about the pregnancy"
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
