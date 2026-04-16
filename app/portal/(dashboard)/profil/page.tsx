import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { SalonProfileEditor } from "@/components/portal/salon-profile-editor"

export const dynamic = "force-dynamic"

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/portal/login")

  // Admin client ile RLS bypass — profil ve salon her zaman okunabilir
  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, salon_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.salon_id && profile?.role !== "ADMIN") redirect("/portal/login")

  const { data: salon } = profile?.salon_id
    ? await adminClient
        .from("salons")
        .select("id, name, slug, tagline, offer, hero_headline, hero_sub, urgency_text, cta_text, primary_color, phone, video_url, testimonials, faq, meta_pixel_id, logo_url, gallery_images")
        .eq("id", profile.salon_id)
        .maybeSingle()
    : { data: null }

  if (!salon) redirect("/portal")

  return <SalonProfileEditor salon={salon} />
}
