"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, FileText, Activity, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

export function PatientPortalNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems = [
    { href: "/portal", label: "Overview", icon: Activity },
    { href: "/portal/appointments", label: "Appointments", icon: Calendar },
    { href: "/portal/records", label: "Medical Records", icon: FileText },
    { href: "/portal/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-sky-600" />
            </div>
            <span className="font-semibold text-lg">Patient Portal</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
