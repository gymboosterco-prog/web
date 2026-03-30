import { createClient } from "@/lib/supabase/server"
import { LeadsDashboard } from "@/components/admin/leads-dashboard"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Fetch user profile for role
  const { data: { user } } = await supabase.auth.getUser()
  console.log("SERVER LOG - User ID:", user?.id)

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single()
  
  if (profileError) {
    console.error("SERVER LOG - Profile Error:", profileError)
  }
  console.log("SERVER LOG - Profile Data:", profile)

  const userRole = profile?.role || 'STAFF'
  console.log("SERVER LOG - Final Role:", userRole)

  // Fetch leads with role-based filtering
  let query = supabase.from("leads").select("*")
  
  if (userRole === 'STAFF') {
    // Staff only sees operational leads
    query = query.in('status', ['new', 'called', 'meeting_done'])
  }

  const { data: leads } = await query.order("created_at", { ascending: false })

  return <LeadsDashboard 
    initialLeads={leads || []} 
    userRole={userRole} 
    serverUserId={user?.id}
    profileError={profileError}
  />
}
