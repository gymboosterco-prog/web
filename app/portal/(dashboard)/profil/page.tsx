import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SalonProfileEditor } from "@/components/portal/salon-profile-editor"

export const dynamic = "force-dynamic"

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/portal/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, salon_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.salon_id && profile?.role !== "ADMIN") redirect("/portal/login")

  const { data: salon } = profile?.salon_id
    ? await supabase
        .from("salons")
        .select("id, name, slug, tagline, offer, hero_headline, hero_sub, urgency_text, cta_text, primary_color, phone")
        .eq("id", profile.salon_id)
        .maybeSingle()
    : { data: null }

  if (!salon) redirect("/portal")

  return <SalonProfileEditor salon={salon} />
}
