  import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createClient(supabaseUrl, serviceRoleKey)

const targetUsers = [
  { email: "2205719kca@gmail.com", password: "!@!@1212" },
  { email: "narutoobayo@gmail.com", password: "!@!@1212" },
  { email: "holicwaka7@gmail.com", password: "!@!@1212" },
]

async function main() {
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) throw error

  for (const target of targetUsers) {
    const user = data.users.find(
      (u) => u.email?.toLowerCase() === target.email.toLowerCase(),
    )

    if (!user) {
      console.log(`No auth user found for ${target.email}`)
      continue
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: target.password,
    })

    if (updateError) {
      console.error(`Failed to update ${target.email}:`, updateError.message)
      continue
    }

    console.log(`Password updated for ${target.email}`)
  }
}

main().catch(console.error)