import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-sky-50 to-white p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">PreNatal Care</h1>
        </div>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Account Created</CardTitle>
            <CardDescription>Your account is pending clinic linkage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground leading-relaxed">
              Thanks for signing up! A clinic staff member will link your account to a patient record before you can
              access your portal.
            </p>
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Note:</strong> If email confirmation is enabled in Supabase, you&apos;ll still need to confirm your
                email before signing in.
              </p>
            </div>
            <Link href="/auth/login" className="block">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
