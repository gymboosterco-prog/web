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

  // Health data: leads from last 2 months for trend + conversion
  const now = new Date()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const { data: healthData } = await supabase
    .from("salon_leads")
    .select("salon_id, status, created_at")
    .is("deleted_at", null)
    .gte("created_at", lastMonthStart)

  // Portal owner last seen
  const { data: ownerProfiles } = await supabase
    .from("profiles")
    .select("salon_id, last_seen_at, email")
    .eq("role", "SALON_OWNER")
    .not("salon_id", "is", null)

  return (
    <SalonsDashboard
      initialSalons={salons || []}
      healthData={healthData || []}
      ownerProfiles={ownerProfiles || []}
    />
  )
}
