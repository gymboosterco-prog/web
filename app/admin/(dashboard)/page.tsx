import { createClient } from "@/lib/supabase/server"
import { LeadsDashboard } from "@/components/admin/leads-dashboard"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Fetch user profile for role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single()

  const userRole = profile?.role || 'STAFF'

  // Fetch leads with role-based filtering
  let query = supabase.from("leads").select("*")
  
  if (userRole === 'STAFF') {
    // Staff only sees operational leads
    query = query.in('status', ['new', 'called', 'meeting_done'])
  }

  const { data: leads } = await query.order("created_at", { ascending: false })

  return <LeadsDashboard initialLeads={leads || []} userRole={userRole} />
}
