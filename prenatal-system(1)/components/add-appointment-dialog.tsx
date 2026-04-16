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

export function AddAppointmentDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [appointmentType, setAppointmentType] = useState("checkup")
  const router = useRouter()

  const toIsoDateTime = (dateValue: string, timeValue: string) => {
    const localDateTime = new Date(`${dateValue}T${timeValue}`)
    if (Number.isNaN(localDateTime.getTime())) return null
    return localDateTime.toISOString()
  }

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
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const appointmentDate = formData.get("appointmentDate") as string
    const appointmentTime = formData.get("appointmentTime") as string
    const dateTime = toIsoDateTime(appointmentDate, appointmentTime)

    if (!dateTime) {
      setIsLoading(false)
      return
    }

    const { data: insertedAppointment, error } = await supabase
      .from("appointments")
      .insert({
      patient_id: selectedPatient,
      doctor_id: user?.id,
      appointment_date: dateTime,
      duration_minutes: Number.parseInt(formData.get("duration") as string),
      appointment_type: appointmentType,
      status: "scheduled",
      notes: formData.get("notes") as string,
      created_by: user?.id,
      })
      .select("id")
      .single()

    setIsLoading(false)

    if (!error) {
      if (insertedAppointment?.id) {
        try {
          const notifyResponse = await fetch("/api/notify-appointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appointmentId: insertedAppointment.id }),
          })

          if (!notifyResponse.ok) {
            const notifyResult = await notifyResponse.json().catch(() => ({}))
            console.error("Failed to send appointment notification:", notifyResult)
          }
        } catch (notifyError) {
          console.error("Failed to send appointment notification:", notifyError)
        }
      }

      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>Create a new appointment for a patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
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

          <div className="space-y-2">
            <Label htmlFor="appointmentType">Appointment Type *</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType} required>
              <SelectTrigger id="appointmentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkup">Regular Checkup</SelectItem>
                <SelectItem value="ultrasound">Ultrasound</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Date *</Label>
              <Input id="appointmentDate" name="appointmentDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Time *</Label>
              <Input id="appointmentTime" name="appointmentTime" type="time" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input id="duration" name="duration" type="number" defaultValue="30" min="15" step="15" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Additional notes or instructions" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedPatient}>
              {isLoading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
