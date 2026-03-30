"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Calendar, FileText, LayoutDashboard, LogOut, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const STAFF_ROLES = new Set(["doctor", "nurse", "admin"])

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingRescheduleCount, setPendingRescheduleCount] = useState(0)

  useEffect(() => {
    const loadRole = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      const role = profile?.role
      setIsAdmin(role === "admin")

      if (!role || !STAFF_ROLES.has(role)) return

      const { count } = await supabase
        .from("appointment_reschedule_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")

      setPendingRescheduleCount(count ?? 0)
    }

    loadRole()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/patients", label: "Patients", icon: Users },
    { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/records", label: "Medical Records", icon: FileText },
    ...(isAdmin ? [{ href: "/dashboard/admin/users", label: "Users", icon: Users }] : []),
  ]

  return (
    <nav className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">PreNatal Care</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const showPendingBadge = item.href === "/dashboard/appointments" && pendingRescheduleCount > 0
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "secondary" : "ghost"} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {showPendingBadge && (
                    <Badge variant="destructive" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                      {pendingRescheduleCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
      <Button variant="ghost" onClick={handleSignOut} className="gap-2">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </nav>
  )
}
