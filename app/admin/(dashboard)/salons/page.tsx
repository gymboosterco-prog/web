import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SalonsDashboard } from "@/components/admin/salons-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminSalonsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle()
  if (profile?.role !== "ADMIN") redirect("/admin")

  const { data: salons } = await supabase
    .from("salons")
    .select("*, salon_leads(count)")
    .order("created_at", { ascending: false })

  return <SalonsDashboard initialSalons={salons || []} />
}
