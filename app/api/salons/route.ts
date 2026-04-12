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

export async function GET() {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const { data, error } = await supabase
    .from("salons")
    .select("*, salon_leads(count)")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

  const body = await request.json()
  const {
    name, slug, owner_name, owner_email, phone,
    city, tagline, offer, salon_type,
    hero_headline, hero_sub, urgency_text, cta_text,
    features, stats, testimonial, testimonial_author,
    primary_color, accent_color, logo_url, pain_points, guarantee_text,
  } = body

  if (!name || !slug) {
    return NextResponse.json({ error: "Salon adı ve slug zorunlu" }, { status: 400 })
  }

  // Slug validation
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Slug sadece küçük harf, rakam ve tire içerebilir" }, { status: 400 })
  }

  // Create salon record
  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .insert([{
      name: name.trim(), slug: slug.trim(),
      owner_name, owner_email, phone,
      city, tagline, offer, salon_type,
      hero_headline, hero_sub, urgency_text, cta_text,
      features: features || [], stats: stats || [],
      testimonial, testimonial_author,
      primary_color, accent_color, logo_url,
      pain_points: pain_points || [], guarantee_text,
    }])
    .select()
    .single()

  if (salonError) {
    if (salonError.code === "23505") {
      return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 })
    }
    return NextResponse.json({ error: salonError.message }, { status: 500 })
  }

  // Invite salon owner if email provided
  if (owner_email) {
    try {
      const adminClient = createAdminClient()

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gymbooster.tr"
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        owner_email,
        {
          redirectTo: `${siteUrl}/auth/callback?next=/portal`,
          data: { salon_id: salon.id, role: "SALON_OWNER" },
        }
      )

      if (!inviteError && inviteData?.user) {
        // Create profile for the invited user
        await adminClient.from("profiles").upsert({
          id: inviteData.user.id,
          role: "SALON_OWNER",
          salon_id: salon.id,
        })
      }
    } catch (e) {
      console.error("Invite gönderilemedi:", e)
      // Don't fail the salon creation if invite fails
    }
  }

  return NextResponse.json({ data: salon })
}
