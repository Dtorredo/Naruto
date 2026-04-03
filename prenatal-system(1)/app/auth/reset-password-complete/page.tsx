"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, CheckCircle, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense, useState, useEffect } from "react"

function ResetPasswordCompleteForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Process the recovery token from URL
    const setupAuth = async () => {
      const supabase = createClient()
      
      // Check if we have a hash fragment with tokens
      const hash = window.location.hash
      if (!hash) {
        setError("No reset token found. Please use the link from your email.")
        setIsProcessing(false)
        return
      }

      try {
        // Parse the hash fragment
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")
        const type = params.get("type")

        if (type !== "recovery" || !accessToken) {
          setError("Invalid reset link. Please request a new password reset.")
          setIsProcessing(false)
          return
        }

        // Set the session manually from the tokens
        if (refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("Session error:", sessionError)
            setError("Failed to process your reset link. Please request a new one.")
          }
        }

        setIsProcessing(false)
      } catch (err) {
        console.error("Token processing error:", err)
        setError("Invalid or expired reset link. Please request a new one.")
        setIsProcessing(false)
      }
    }

    setupAuth()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
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

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess(true)

      // Redirect to portal after 2 seconds
      setTimeout(() => {
        router.push("/auth/redirect")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred while setting your password")
    } finally {
      setIsLoading(false)
    }
  }

  if (isProcessing) {
    return (
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">Processing your reset link...</p>
        </div>
      </CardContent>
    )
  }

  if (success) {
    return (
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">Password Updated!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been set successfully. Redirecting you to your portal...
          </p>
        </div>
      </CardContent>
    )
  }

  return (
    <CardContent>
      <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
        <p className="font-medium">Set Your Password</p>
        <p className="mt-1">Create a secure password to access your patient portal.</p>
      </div>
      <form onSubmit={handleResetPassword}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Setting Password..." : "Set Password"}
          </Button>
        </div>
      </form>
    </CardContent>
  )
}

export default function ResetPasswordCompletePage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-sky-50 to-white p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">PreNatal Care</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Password</CardTitle>
            <CardDescription>Final step to activate your account</CardDescription>
          </CardHeader>
          <Suspense fallback={<CardContent>Loading...</CardContent>}>
            <ResetPasswordCompleteForm />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}
