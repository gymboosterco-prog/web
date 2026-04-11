import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/portal/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

  if (!profile || !["SALON_OWNER", "ADMIN"].includes(profile.role || "")) {
    redirect("/portal/login")
  }

  return <>{children}</>
}
