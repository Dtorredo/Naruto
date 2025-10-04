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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddCheckupDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchAppointments = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients (first_name, last_name)
        `,
        )
        .eq("status", "completed")
        .order("appointment_date", { ascending: false })
        .limit(20)
      if (data) setAppointments(data)
    }
    if (open) fetchAppointments()
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const selectedApt = appointments.find((apt) => apt.id === selectedAppointment)

    const { error } = await supabase.from("checkup_records").insert({
      appointment_id: selectedAppointment,
      patient_id: selectedApt?.patient_id,
      weight_kg: formData.get("weight") ? Number.parseFloat(formData.get("weight") as string) : null,
      blood_pressure: formData.get("bloodPressure") as string,
      fundal_height_cm: formData.get("fundalHeight") ? Number.parseFloat(formData.get("fundalHeight") as string) : null,
      fetal_heart_rate: formData.get("fetalHeartRate")
        ? Number.parseInt(formData.get("fetalHeartRate") as string)
        : null,
      urine_test_results: formData.get("urineTest") as string,
      blood_test_results: formData.get("bloodTest") as string,
      ultrasound_notes: formData.get("ultrasoundNotes") as string,
      complaints: formData.get("complaints") as string,
      diagnosis: formData.get("diagnosis") as string,
      recommendations: formData.get("recommendations") as string,
      next_visit_date: formData.get("nextVisit") as string,
      performed_by: user?.id,
    })

    setIsLoading(false)

    if (!error) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Checkup Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Checkup Record</DialogTitle>
          <DialogDescription>Record the details of a completed checkup appointment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appointment">Completed Appointment *</Label>
            <Select value={selectedAppointment} onValueChange={setSelectedAppointment} required>
              <SelectTrigger id="appointment">
                <SelectValue placeholder="Select an appointment" />
              </SelectTrigger>
              <SelectContent>
                {appointments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>
                    {apt.patients?.first_name} {apt.patients?.last_name} -{" "}
                    {new Date(apt.appointment_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" name="weight" type="number" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodPressure">Blood Pressure</Label>
              <Input id="bloodPressure" name="bloodPressure" placeholder="120/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundalHeight">Fundal Height (cm)</Label>
              <Input id="fundalHeight" name="fundalHeight" type="number" step="0.1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fetalHeartRate">Fetal Heart Rate (bpm)</Label>
            <Input id="fetalHeartRate" name="fetalHeartRate" type="number" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="urineTest">Urine Test Results</Label>
              <Textarea id="urineTest" name="urineTest" placeholder="Test results" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodTest">Blood Test Results</Label>
              <Textarea id="bloodTest" name="bloodTest" placeholder="Test results" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ultrasoundNotes">Ultrasound Notes</Label>
            <Textarea id="ultrasoundNotes" name="ultrasoundNotes" placeholder="Ultrasound findings" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaints">Patient Complaints</Label>
            <Textarea id="complaints" name="complaints" placeholder="Any complaints or concerns" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea id="diagnosis" name="diagnosis" placeholder="Medical diagnosis" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea id="recommendations" name="recommendations" placeholder="Treatment recommendations" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextVisit">Next Visit Date</Label>
            <Input id="nextVisit" name="nextVisit" type="date" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedAppointment}>
              {isLoading ? "Saving..." : "Save Checkup"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
