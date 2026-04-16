"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

type RescheduleRequest = {
  id: string
  status: string
  preferred_datetime: string
  proposed_datetime: string | null
  patient_notes: string | null
  doctor_notes: string | null
  appointments?: {
    appointment_date: string
    appointment_type: string
    patients?: {
      first_name: string
      last_name: string
    }
  }
}

type RescheduleRequestActionsProps = {
  request: RescheduleRequest
}

function formatDateTime(value: string | null) {
  if (!value) return ""
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function RescheduleRequestActions({ request }: RescheduleRequestActionsProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [proposedDate, setProposedDate] = useState("")
  const [proposedTime, setProposedTime] = useState("")
  const [notes, setNotes] = useState("")

  const toIsoDateTime = (dateValue: string, timeValue: string) => {
    const localDateTime = new Date(`${dateValue}T${timeValue}`)
    if (Number.isNaN(localDateTime.getTime())) return null
    return localDateTime.toISOString()
  }

  const submitAction = async (action: "approve" | "decline" | "propose") => {
    const proposedDateTime =
      action === "propose" && proposedDate && proposedTime ? toIsoDateTime(proposedDate, proposedTime) : undefined

    if (action === "propose" && !proposedDateTime) {
      toast({
        title: "Invalid date or time",
        description: "Please choose a valid proposed date and time.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/reschedule-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          proposedDateTime,
          notes,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || "Unable to update reschedule request")
      }

      toast({
        title: action === "approve" ? "Request approved" : action === "decline" ? "Request declined" : "Proposal sent",
        description:
          action === "approve"
            ? "The appointment has been updated to the patient’s preferred time."
            : action === "decline"
              ? "The patient has been notified that the request was declined."
              : "The patient will review the new proposed time.",
      })
      setOpen(false)
      setProposedDate("")
      setProposedTime("")
      setNotes("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-medium capitalize">{request.appointments?.appointment_type || "Appointment"}</p>
          <p className="text-sm text-muted-foreground">
            {request.appointments?.patients?.first_name} {request.appointments?.patients?.last_name}
          </p>
          <p className="text-sm text-muted-foreground">Current time: {formatDateTime(request.appointments?.appointment_date ?? null)}</p>
          <p className="text-sm text-muted-foreground">Requested time: {formatDateTime(request.preferred_datetime)}</p>
          {request.patient_notes && <p className="text-sm text-muted-foreground">Patient note: {request.patient_notes}</p>}
          {request.doctor_notes && <p className="text-sm text-muted-foreground">Clinic note: {request.doctor_notes}</p>}
        </div>
        <Badge variant={request.status === "pending" ? "outline" : request.status === "proposed" ? "secondary" : "default"}>
          {request.status}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => submitAction("approve")} disabled={isSubmitting}>
          Approve request
        </Button>
        <Button size="sm" variant="outline" onClick={() => submitAction("decline")} disabled={isSubmitting}>
          Decline
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">
              Propose new time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Propose a new time</DialogTitle>
              <DialogDescription>Suggest an alternative date and time for the patient to confirm.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`proposed-date-${request.id}`}>Date</Label>
                  <Input id={`proposed-date-${request.id}`} type="date" value={proposedDate} onChange={(event) => setProposedDate(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`proposed-time-${request.id}`}>Time</Label>
                  <Input id={`proposed-time-${request.id}`} type="time" value={proposedTime} onChange={(event) => setProposedTime(event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`doctor-notes-${request.id}`}>Notes for patient</Label>
                <Textarea
                  id={`doctor-notes-${request.id}`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Example: Please come at 10:30 AM instead."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => submitAction("propose")} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send proposal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
