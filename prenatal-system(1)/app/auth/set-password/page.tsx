"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, CheckCircle, Lock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"

function SetPasswordForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")

  useEffect(() => {
    // Pre-fill email if provided in URL
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [emailParam])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!email) {
      setError("Email is required")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      // Send a password reset email to the user
      // This is more reliable than trying to verify an expired invite token
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password-complete`,
      })

      if (resetError) {
        throw new Error(resetError.message)
      }

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again or contact your clinic.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">Check Your Email!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent you a password reset link to <strong>{email}</strong>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Click the link in that email to set your password and activate your account.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or contact your clinic.
          </p>
        </div>
      </CardContent>
    )
  }

  return (
    <CardContent>
      <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
        <p className="font-medium">Welcome! You've been invited to join Prenatal Care.</p>
        <p className="mt-1">For security, we'll send you a separate email to set your password.</p>
      </div>
      <form onSubmit={handleSetPassword}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!emailParam}
            />
            {emailParam && (
              <p className="text-xs text-muted-foreground">Email pre-filled from your invite</p>
            )}
          </div>
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
            <p className="font-medium">Next Steps:</p>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>Click "Send Reset Link" below</li>
              <li>Check your email inbox</li>
              <li>Click the link in the email</li>
              <li>Create your password</li>
            </ol>
          </div>
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Password Reset Link"}
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </CardContent>
  )
}

import Link from "next/link"

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-sky-50 to-white p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">PreNatal Care</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Activate Your Account</CardTitle>
            <CardDescription>Verify your email to set your password</CardDescription>
          </CardHeader>
          <Suspense fallback={<CardContent>Loading...</CardContent>}>
            <SetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}
