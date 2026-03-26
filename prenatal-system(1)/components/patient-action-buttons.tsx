"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type PatientActionButtonsProps = {
  patientId: string
  patientName: string
  patientEmail: string | null
}

export function PatientActionButtons({ patientId, patientName, patientEmail }: PatientActionButtonsProps) {
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canResend = Boolean(patientEmail)
  const resendDisabledReason = canResend ? null : "Missing patient email"

  const handleResendInvite = async () => {
    if (!canResend) return

    setIsResending(true)
    try {
      const response = await fetch(`/api/patients/${patientId}/resend-invite`, {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Unable to resend invite")
      }

      toast({
        title: "Invite resent",
        description: `We re-sent the invite email to ${patientEmail}.`,
      })
    } catch (error) {
      toast({
        title: "Resend failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Unable to delete patient")
      }

      toast({
        title: "Patient deleted",
        description: `${patientName} has been removed from the roster.`,
      })
      router.push("/dashboard/patients")
      router.refresh()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-col gap-1">
        <Button variant="secondary" disabled={!canResend || isResending} onClick={handleResendInvite}>
          {isResending ? "Sending..." : "Resend Invite"}
        </Button>
        {resendDisabledReason && <p className="text-xs text-muted-foreground">{resendDisabledReason}</p>}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isDeleting}>
            Delete Patient
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {patientName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Patients can only be deleted when no appointments, prenatal records,
              checkups, prescriptions, or vaccinations reference them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
