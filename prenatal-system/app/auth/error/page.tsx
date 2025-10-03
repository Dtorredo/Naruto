import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function ErrorPage({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-sky-50 to-white p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">PreNatal Care</h1>
        </div>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error ? (
              <div className="rounded-md bg-destructive/10 p-4">
                <p className="text-sm text-destructive">Error: {params.error}</p>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                An unexpected error occurred during authentication.
              </p>
            )}
            <Link href="/auth/login" className="block">
              <Button className="w-full">Back to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
