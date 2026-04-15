import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const OWNER_ALLOWED_FIELDS = [
  "offer", "urgency_text", "cta_text",
  "hero_headline", "hero_sub", "tagline",
  "primary_color", "phone",
]

async function requireSalonOwner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, salon_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || !["SALON_OWNER", "ADMIN"].includes(profile.role || "")) return null
  if (!profile.salon_id) return null

  return { supabase, salonId: profile.salon_id }
}

export async function GET() {
  const ctx = await requireSalonOwner()
  if (!ctx) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { supabase, salonId } = ctx
  const { data, error } = await supabase
    .from("salons")
    .select("id, name, slug, tagline, offer, hero_headline, hero_sub, urgency_text, cta_text, primary_color, phone")
    .eq("id", salonId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request) {
  const ctx = await requireSalonOwner()
  if (!ctx) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { supabase, salonId } = ctx
  const body = await request.json()

  const updates: Record<string, unknown> = {}
  for (const key of OWNER_ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("salons")
    .update(updates)
    .eq("id", salonId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
