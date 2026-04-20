import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type RouteParams = {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const appointmentId = params?.id

  if (!appointmentId) {
    return NextResponse.json({ error: "Appointment id is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profileError || profile?.role !== "patient") {
    return NextResponse.json({ error: "Only patients can request a reschedule." }, { status: 403 })
  }

  const { data: patient, error: patientError } = await supabase.from("patients").select("id").eq("user_id", user.id).single()

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient record not found" }, { status: 404 })
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, patient_id, appointment_date, status")
    .eq("id", appointmentId)
    .eq("patient_id", patient.id)
    .single()

  if (appointmentError || !appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
  }

  const appointmentDate = new Date(appointment.appointment_date)
  const now = new Date()

  if (!["scheduled", "confirmed"].includes(appointment.status) || Number.isNaN(appointmentDate.getTime()) || appointmentDate <= now) {
    return NextResponse.json({ error: "Only upcoming scheduled or confirmed appointments can be rescheduled." }, { status: 409 })
  }

  const payload = await request.json().catch(() => ({}))
  const preferredDateTime = typeof payload.preferredDateTime === "string" ? payload.preferredDateTime.trim() : ""
  const patientNotes = typeof payload.notes === "string" ? payload.notes.trim() : ""

  if (!preferredDateTime) {
    return NextResponse.json({ error: "Preferred date and time are required" }, { status: 400 })
  }

  const preferredDate = new Date(preferredDateTime)
  if (Number.isNaN(preferredDate.getTime())) {
    return NextResponse.json({ error: "Preferred date and time is invalid" }, { status: 400 })
  }

  const { data: existingRequest, error: existingError } = await supabase
    .from("appointment_reschedule_requests")
    .select("id, status")
    .eq("appointment_id", appointmentId)
    .in("status", ["pending", "proposed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (existingRequest) {
    return NextResponse.json(
      { error: "A reschedule request is already pending for this appointment." },
      { status: 409 },
    )
  }

  const { error: insertError } = await supabase.from("appointment_reschedule_requests").insert({
    appointment_id: appointment.id,
    patient_id: patient.id,
    status: "pending",
    preferred_datetime: preferredDateTime,
    patient_notes: patientNotes || null,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
