import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const STAFF_ROLES = new Set(["doctor", "nurse", "admin"])

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = await params

  if (!patientId) {
    return NextResponse.json({ error: "Patient id is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.role || !STAFF_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .eq("id", patientId)
    .single()

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 })
  }

  const blockingResources: { table: "appointments" | "prenatal_records" | "checkup_records" | "prescriptions" | "vaccinations"; label: string }[] = [
    { table: "appointments", label: "appointments" },
    { table: "prenatal_records", label: "prenatal records" },
    { table: "checkup_records", label: "checkups" },
    { table: "prescriptions", label: "prescriptions" },
    { table: "vaccinations", label: "vaccinations" },
  ]

  for (const resource of blockingResources) {
    const { count, error } = await supabase
      .from(resource.table)
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete patient because ${count} ${resource.label} still reference this record. Remove those first.`,
        },
        { status: 409 },
      )
    }
  }

  const { error: deleteError } = await supabase.from("patients").delete().eq("id", patientId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
