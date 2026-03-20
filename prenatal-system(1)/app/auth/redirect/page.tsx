import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthRedirectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (error || !profile?.role) {
    redirect("/auth/error?error=Missing%20profile%20or%20insufficient%20permissions")
  }

  const role = profile.role

  if (role === "patient") {
    redirect("/portal")
  }

  if (role === "admin") {
    redirect("/dashboard/admin/users")
  }

  redirect("/dashboard")
}
