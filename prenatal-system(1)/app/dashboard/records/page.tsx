import { createClient } from "@/lib/supabase/server"
import { AddPrenatalRecordDialog } from "@/components/add-prenatal-record-dialog"
import { AddCheckupDialog } from "@/components/add-checkup-dialog"
import { RecordsPageClient } from "@/components/records-page-client"

export default async function RecordsPage() {
  const supabase = await createClient()

  const { data: prenatalRecords } = await supabase
    .from("prenatal_records")
    .select(
      `
      *,
      patients (first_name, last_name)
    `,
    )
    .order("created_at", { ascending: false })

  const { data: checkupRecords } = await supabase
    .from("checkup_records")
    .select(
      `
      *,
      patients (first_name, last_name),
      appointments (appointment_date, appointment_type)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(20)

  const activePregnancies = prenatalRecords?.filter((record) => record.pregnancy_status === "active")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground">Track prenatal records and checkup history</p>
        </div>
        <div className="flex gap-2">
          <AddPrenatalRecordDialog />
          <AddCheckupDialog />
        </div>
      </div>

      <RecordsPageClient
        prenatalRecords={prenatalRecords || []}
        checkupRecords={checkupRecords || []}
        activePregnanciesCount={activePregnancies?.length || 0}
      />
    </div>
  )
}
