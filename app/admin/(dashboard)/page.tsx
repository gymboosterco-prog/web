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
    .maybeSingle()
  
  const userRole = profile?.role || 'STAFF'

  // Fetch first 50 leads with role-based filtering (SSR)
  let query = supabase.from("leads").select("*", { count: 'exact' })

  if (userRole === 'STAFF') {
    query = query.in('status', ['new', 'called', 'meeting_done'])
  }

  const { data: leads, count } = await query
    .order("created_at", { ascending: false })
    .range(0, 49)

  return <LeadsDashboard
    initialLeads={leads || []}
    initialTotal={count ?? 0}
    userRole={userRole}
  />
}
