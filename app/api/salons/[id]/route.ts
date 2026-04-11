import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "ADMIN") return null
  return supabase
}

const ALLOWED_FIELDS = [
  "name", "slug", "salon_type", "city", "phone", "tagline", "offer",
  "hero_headline", "hero_sub", "urgency_text", "cta_text",
  "features", "stats", "testimonial", "testimonial_author",
  "owner_name", "owner_email", "active",
  "primary_color", "accent_color", "logo_url", "pain_points", "guarantee_text",
]

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const body = await request.json()

  if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
    return NextResponse.json({ error: "Slug sadece küçük harf, rakam ve tire içerebilir" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabase.from("salons").update(updates).eq("id", id).select().single()
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { error } = await supabase.from("salons").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
