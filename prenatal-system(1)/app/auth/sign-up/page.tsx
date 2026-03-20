import { redirect } from "next/navigation"

export default function SignUpPage() {
  redirect("/auth/login?invite=1")
}