import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/portal/login")

  let { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

  // Profile yoksa salons tablosundan owner_email ile eşleştirip otomatik oluştur
  if (!profile && user.email) {
    try {
      const adminClient = createAdminClient()
      const { data: salon } = await adminClient
        .from("salons")
        .select("id")
        .eq("owner_email", user.email)
        .maybeSingle()

      if (salon) {
        await adminClient.from("profiles").upsert({
          id: user.id,
          email: user.email,
          role: "SALON_OWNER",
          salon_id: salon.id,
        })
        profile = { role: "SALON_OWNER" }
      }
    } catch (e) {
      console.error("Profile otomatik oluşturulamadı:", e)
    }
  }

  if (!profile || !["SALON_OWNER", "ADMIN"].includes(profile.role || "")) {
    redirect("/portal/login")
  }

  return <>{children}</>
}
