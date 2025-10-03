import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { Mail, Phone, Calendar, Droplet } from "lucide-react"
import Link from "next/link"

export default async function PatientsPage() {
  const supabase = await createClient()

  const { data: patients } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <AddPatientDialog />
      </div>

      <div className="flex items-center gap-4">
        <Input placeholder="Search patients..." className="max-w-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients && patients.length > 0 ? (
          patients.map((patient) => (
            <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {calculateAge(patient.date_of_birth)} years old
                      </CardDescription>
                    </div>
                    {patient.blood_type && (
                      <Badge variant="secondary" className="gap-1">
                        <Droplet className="h-3 w-3" />
                        {patient.blood_type}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {patient.phone}
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {patient.email}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No patients found. Add your first patient to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
