import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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
  "testimonials", "video_url", "faq",
  "owner_name", "owner_email", "active",
  "primary_color", "accent_color", "logo_url", "pain_points", "guarantee_text",
]

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const body = await request.json()
  const { owner_password, ...rest } = body

  if (rest.slug && !/^[a-z0-9-]+$/.test(rest.slug)) {
    return NextResponse.json({ error: "Slug sadece küçük harf, rakam ve tire içerebilir" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in rest) updates[key] = rest[key]
  }

  const { data, error } = await supabase.from("salons").update(updates).eq("id", id).select().single()
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sync owner profile and optionally update password
  const ownerEmail = data.owner_email
  if (ownerEmail) {
    try {
      const adminClient = createAdminClient()

      // Find the auth user by email
      const { data: listData } = await adminClient.auth.admin.listUsers()
      const authUser = listData?.users?.find(u => u.email === ownerEmail)

      if (authUser) {
        // Ensure profile exists with correct role and salon
        await adminClient.from("profiles").upsert({
          id: authUser.id,
          email: ownerEmail,
          role: "SALON_OWNER",
          salon_id: id,
        })

        // Update password if provided
        if (owner_password && owner_password.length >= 6) {
          await adminClient.auth.admin.updateUserById(authUser.id, { password: owner_password })
        }
      }
    } catch (e) {
      console.error("Salon sahibi profili güncellenemedi:", e)
    }
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
