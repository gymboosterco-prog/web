import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

const OWNER_ALLOWED_FIELDS = [
  "offer", "urgency_text", "cta_text",
  "hero_headline", "hero_sub", "tagline",
  "primary_color", "phone",
  "testimonials", "video_url", "faq",
  "meta_pixel_id",
  "logo_url",
  "gallery_images",
  "whatsapp_template",
]

async function requireSalonOwner(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, salon_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || !["SALON_OWNER", "ADMIN"].includes(profile.role || "")) return null
  if (!profile.salon_id) return null

  return profile.salon_id
}

export async function GET() {
  const salonId = await requireSalonOwner()
  if (!salonId) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("salons")
    .select("id, name, slug, tagline, offer, hero_headline, hero_sub, urgency_text, cta_text, primary_color, phone, video_url, testimonials, faq")
    .eq("id", salonId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request) {
  const salonId = await requireSalonOwner()
  if (!salonId) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const body = await request.json()

  const updates: Record<string, unknown> = {}
  for (const key of OWNER_ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("salons")
    .update(updates)
    .eq("id", salonId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
