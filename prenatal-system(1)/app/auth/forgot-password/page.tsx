"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Failed to send reset email")
      }

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-sky-50 to-white p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Activity className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">PreNatal Care</h1>
        </div>

        <Link href="/auth/login" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              No worries! Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
                  <Mail className="mb-2 h-8 w-8 text-green-600" />
                  <p className="font-semibold">Check your email!</p>
                  <p>We've sent you a password reset link. It will expire in 1 hour.</p>
                  <p className="mt-2 text-xs text-green-700">
                    Didn't receive it? Check your spam folder or try again.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => setSuccess(false)}>
                    Try again
                  </Button>
                  <Button asChild>
                    <Link href="/auth/login">Back to login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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
                    />
                  </div>
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
