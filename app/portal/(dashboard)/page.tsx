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

  // Update last_seen_at — fire-and-forget, don't block render
  supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user!.id)
    .then()

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

  // Page analytics for this month
  const firstOfMonth = new Date(
    new Date().getFullYear(), new Date().getMonth(), 1
  ).toISOString()

  const { data: events } = profile?.salon_id
    ? await supabase
        .from("page_events")
        .select("event_type")
        .eq("salon_id", profile.salon_id)
        .gte("created_at", firstOfMonth)
    : { data: [] }

  const pageStats = events
    ? {
        views: events.filter(e => e.event_type === "page_view").length,
        submits: events.filter(e => e.event_type === "form_submit").length,
      }
    : null

  return (
    <SalonCRM
      salon={salon}
      initialLeads={leads || []}
      initialTotal={count ?? 0}
      pageStats={pageStats}
    />
  )
}
