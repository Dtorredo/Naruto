import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

const STAFF_ROLES = new Set(["doctor", "nurse", "admin"])

type RouteParams = {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const requestId = params?.id

  if (!requestId) {
    return NextResponse.json({ error: "Request id is required" }, { status: 400 })
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

  if (profileError || !profile?.role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const isStaff = STAFF_ROLES.has(profile.role)
  const isPatient = profile.role === "patient"

  if (!isStaff && !isPatient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const payload = await request.json().catch(() => ({}))
  const action = typeof payload.action === "string" ? payload.action.trim() : ""

  if (!action) {
    return NextResponse.json({ error: "Action is required" }, { status: 400 })
  }

  const { data: rescheduleRequest, error: requestError } = await supabase
    .from("appointment_reschedule_requests")
    .select(
      `
      id,
      status,
      appointment_id,
      patient_id,
      preferred_datetime,
      proposed_datetime,
      patient_notes,
      doctor_notes,
      appointments (
        id,
        appointment_date,
        appointment_type,
        status
      )
    `,
    )
    .eq("id", requestId)
    .single()

  if (requestError || !rescheduleRequest) {
    return NextResponse.json({ error: "Reschedule request not found" }, { status: 404 })
  }

  const currentStatus = rescheduleRequest.status

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
  }

  const adminClient = createSupabaseAdminClient(process.env.SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const now = new Date().toISOString()

  if (isPatient) {
    const { data: patient, error: patientError } = await supabase.from("patients").select("id").eq("user_id", user.id).single()

    if (patientError || !patient || patient.id !== rescheduleRequest.patient_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (currentStatus !== "proposed") {
      return NextResponse.json({ error: "This request is not waiting for patient confirmation." }, { status: 409 })
    }

    if (action === "accept") {
      if (!rescheduleRequest.proposed_datetime) {
        return NextResponse.json({ error: "This request is missing a proposed date and time." }, { status: 400 })
      }

      const { error: applyError } = await adminClient.rpc("apply_reschedule_request", {
        p_request_id: requestId,
        p_new_datetime: rescheduleRequest.proposed_datetime,
        p_reviewer_id: user.id,
      })

      if (applyError) {
        return NextResponse.json({ error: applyError.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true })
    }

    if (action === "decline") {
      const { error: updateError } = await adminClient
        .from("appointment_reschedule_requests")
        .update({
          status: "declined",
          reviewed_by: user.id,
          reviewed_at: now,
          updated_at: now,
        })
        .eq("id", requestId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
  }

  if (!isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (currentStatus !== "pending") {
    return NextResponse.json({ error: "This request has already been processed." }, { status: 409 })
  }

  if (action === "approve") {
    if (!rescheduleRequest.preferred_datetime) {
      return NextResponse.json({ error: "This request is missing a preferred date and time." }, { status: 400 })
    }

    const { error: applyError } = await adminClient.rpc("apply_reschedule_request", {
      p_request_id: requestId,
      p_new_datetime: rescheduleRequest.preferred_datetime,
      p_reviewer_id: user.id,
    })

    if (applyError) {
      return NextResponse.json({ error: applyError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  }

  if (action === "propose") {
    const proposedDateTime = typeof payload.proposedDateTime === "string" ? payload.proposedDateTime.trim() : ""
    const notes = typeof payload.notes === "string" ? payload.notes.trim() : ""

    if (!proposedDateTime) {
      return NextResponse.json({ error: "Proposed date and time are required" }, { status: 400 })
    }

    const proposedDate = new Date(proposedDateTime)
    if (Number.isNaN(proposedDate.getTime())) {
      return NextResponse.json({ error: "Proposed date and time is invalid" }, { status: 400 })
    }

    const { error: updateError } = await adminClient
      .from("appointment_reschedule_requests")
      .update({
        status: "proposed",
        proposed_datetime: proposedDate.toISOString(),
        doctor_notes: notes || null,
        reviewed_by: user.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", requestId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  }

  if (action === "decline") {
    const notes = typeof payload.notes === "string" ? payload.notes.trim() : ""

    const { error: updateError } = await adminClient
      .from("appointment_reschedule_requests")
      .update({
        status: "declined",
        doctor_notes: notes || null,
        reviewed_by: user.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", requestId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
}
