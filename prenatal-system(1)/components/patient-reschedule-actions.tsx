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
}

type PatientRescheduleActionsProps = {
  appointmentId: string
  existingRequest?: RescheduleRequest | null
}

function formatDateTime(value: string | null) {
  if (!value) return ""
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function PatientRescheduleActions({ appointmentId, existingRequest }: PatientRescheduleActionsProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [requestDate, setRequestDate] = useState("")
  const [requestTime, setRequestTime] = useState("")
  const [notes, setNotes] = useState("")

  const resetForm = () => {
    setRequestDate("")
    setRequestTime("")
    setNotes("")
  }

  const toDateTimeValue = (dateValue: string, timeValue: string) => {
    if (!dateValue || !timeValue) return null
    return `${dateValue}T${timeValue}:00`
  }

  const submitRequest = async () => {
    if (!requestDate || !requestTime) {
      toast({
        title: "Missing date or time",
        description: "Choose a preferred date and time for the reschedule request.",
        variant: "destructive",
      })
      return
    }

    const preferredDateTime = toDateTimeValue(requestDate, requestTime)
    if (!preferredDateTime) {
      toast({
        title: "Invalid date or time",
        description: "Please choose a valid preferred date and time.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/reschedule-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredDateTime,
          notes,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || "Unable to submit reschedule request")
      }

      toast({
        title: "Request sent",
        description: "Your clinic will review the reschedule request.",
      })
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const respondToProposal = async (action: "accept" | "decline") => {
    if (!existingRequest) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/reschedule-requests/${existingRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result?.error || "Unable to update reschedule request")
      }

      toast({
        title: action === "accept" ? "Appointment updated" : "Proposal declined",
        description:
          action === "accept"
            ? "Your appointment has been moved to the proposed date and time."
            : "The clinic has been notified that the proposed time does not work.",
      })
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

  if (existingRequest?.status === "proposed") {
    return (
      <div className="space-y-3 rounded-lg border bg-background p-3">
        <div className="space-y-1">
          <Badge variant="secondary">New time proposed</Badge>
          <p className="text-sm text-muted-foreground">Proposed: {formatDateTime(existingRequest.proposed_datetime)}</p>
          {existingRequest.doctor_notes && (
            <p className="text-sm text-muted-foreground">Clinic note: {existingRequest.doctor_notes}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => respondToProposal("accept")} disabled={isSubmitting}>
            Accept new time
          </Button>
          <Button size="sm" variant="outline" onClick={() => respondToProposal("decline")} disabled={isSubmitting}>
            Decline
          </Button>
        </div>
      </div>
    )
  }

  if (existingRequest?.status === "pending") {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Badge variant="outline">Reschedule request pending</Badge>
        <p className="text-sm text-muted-foreground">We received your request and the clinic will review it soon.</p>
        {existingRequest.patient_notes && <p className="text-sm text-muted-foreground">Notes: {existingRequest.patient_notes}</p>}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Request reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request a reschedule</DialogTitle>
          <DialogDescription>Share your preferred date and time, and add any context for the clinic.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferred-date">Preferred date</Label>
              <Input id="preferred-date" type="date" value={requestDate} onChange={(event) => setRequestDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred-time">Preferred time</Label>
              <Input id="preferred-time" type="time" value={requestTime} onChange={(event) => setRequestTime(event.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reschedule-notes">Additional information</Label>
            <Textarea
              id="reschedule-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="For example: I’m available any time after 2 PM."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submitRequest} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
