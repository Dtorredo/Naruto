import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminUsersTable } from "@/components/admin-users-table"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (me?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, specialization, phone, created_at")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage user roles and access</p>
      </div>

      <AdminUsersTable profiles={profiles ?? []} />
    </div>
  )
}
