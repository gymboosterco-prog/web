import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

  if (!profile || !["ADMIN", "STAFF"].includes(profile.role || "")) redirect("/portal")

  const isAdmin = profile.role === "ADMIN"

  return (
    <div className="min-h-screen bg-background">
      {isAdmin && (
        <div className="border-b border-border bg-card px-4">
          <div className="flex gap-1 max-w-7xl mx-auto">
            <Link href="/admin" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent hover:border-primary/50">
              Başvurular
            </Link>
            <Link href="/admin/salons" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent hover:border-primary/50">
              Salonlar
            </Link>
            <Link href="/admin/teklifler" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent hover:border-primary/50">
              Teklifler
            </Link>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
