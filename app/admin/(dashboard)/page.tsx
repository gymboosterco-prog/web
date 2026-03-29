import { createClient } from "@/lib/supabase/server"
import { LeadsDashboard } from "@/components/admin/leads-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  return <LeadsDashboard initialLeads={leads || []} />
}
