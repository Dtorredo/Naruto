import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, Droplet, AlertCircle, FileText } from "lucide-react"

export default async function PatientProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: patient } = await supabase.from("patients").select("*").eq("user_id", user?.id).single()

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Patient Record Pending</CardTitle>
            <CardDescription>
              Your account hasn&apos;t been linked to a patient record yet. A clinic staff member will complete this step.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Your personal and medical information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">
                {patient.first_name} {patient.last_name}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{calculateAge(patient.date_of_birth)} years</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</span>
              </div>
              {patient.blood_type && (
                <div className="flex items-center gap-2 text-sm">
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Blood Type:</span>
                  <Badge variant="secondary">{patient.blood_type}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{patient.email}</span>
              </div>
            )}
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{patient.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {patient.emergency_contact_name && <p className="font-medium">{patient.emergency_contact_name}</p>}
              {patient.emergency_contact_phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {patient.emergency_contact_phone}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.allergies ? (
              <p className="text-sm leading-relaxed">{patient.allergies}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No known allergies</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.medical_history ? (
              <p className="text-sm leading-relaxed">{patient.medical_history}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No medical history recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
