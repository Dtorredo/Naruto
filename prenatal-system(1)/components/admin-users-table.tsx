"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useTransition } from "react"

type Profile = {
  id: string
  email: string
  full_name: string
  role: string
  specialization: string | null
  phone: string | null
  created_at: string
}

const ROLE_OPTIONS = ["patient", "doctor", "nurse", "admin"] as const

export function AdminUsersTable({ profiles }: { profiles: Profile[] }) {
  const [roles, setRoles] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    profiles.forEach((p) => {
      initial[p.id] = p.role
    })
    return initial
  })

  const [saving, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSave = (profileId: string) => {
    const nextRole = roles[profileId]
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { error: updateError } = await supabase.from("profiles").update({ role: nextRole }).eq("id", profileId)

      if (updateError) {
        setError(updateError.message)
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => {
            const currentRole = roles[p.id] ?? p.role

            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.full_name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>
                  <Select
                    value={currentRole}
                    onValueChange={(value) => setRoles((prev) => ({ ...prev, [p.id]: value }))}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => handleSave(p.id)} disabled={saving || currentRole === p.role}>
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
