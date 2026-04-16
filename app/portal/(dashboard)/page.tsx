import { createClient } from "@/lib/supabase/server"
import { SalonCRM } from "@/components/portal/salon-crm"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PortalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, salon_id")
    .eq("id", user!.id)
    .maybeSingle()

  if (!profile?.salon_id && profile?.role !== "ADMIN") {
    redirect("/portal/login")
  }

  // Fetch salon info
  const { data: salon } = profile?.salon_id
    ? await supabase.from("salons").select("*").eq("id", profile.salon_id).maybeSingle()
    : { data: null }

  // Fetch leads (RLS handles filtering)
  let query = supabase.from("salon_leads").select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(0, 49)
  if (profile?.salon_id) query = query.eq("salon_id", profile.salon_id)

  const { data: leads, count } = await query

  return (
    <SalonCRM
      salon={salon}
      initialLeads={leads || []}
      initialTotal={count ?? 0}
    />
  )
}
