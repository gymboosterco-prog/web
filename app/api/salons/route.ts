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
    name, slug, owner_name, owner_email, owner_password, phone,
    city, tagline, offer, salon_type,
    hero_headline, hero_sub, urgency_text, cta_text,
    features, stats, testimonial, testimonial_author,
    testimonials, video_url, faq, meta_pixel_id,
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
      testimonials: testimonials || null, video_url: video_url || null, faq: faq || null,
      meta_pixel_id: meta_pixel_id || null,
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

  // Create or invite salon owner if email provided
  if (owner_email) {
    try {
      const adminClient = createAdminClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gymbooster.tr"

      let userId: string | undefined

      if (owner_password) {
        // Try to create user directly with password (no invite email)
        const { data: created, error: createError } = await adminClient.auth.admin.createUser({
          email: owner_email,
          password: owner_password,
          email_confirm: true,
        })

        if (createError) {
          // User likely already exists — find them via profiles first, fallback to listUsers
          const { data: profileRow } = await adminClient
            .from("profiles").select("id").eq("email", owner_email).maybeSingle()
          const existingUser = profileRow
            ?? (await adminClient.auth.admin.listUsers()).data?.users?.find(u => u.email === owner_email)
          if (existingUser) {
            await adminClient.auth.admin.updateUserById(existingUser.id, { password: owner_password })
            userId = existingUser.id
          } else {
            console.error("Kullanıcı oluşturulamadı:", createError)
          }
        } else if (created?.user) {
          userId = created.user.id
        }
      } else {
        // Send invite email (existing flow)
        const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
          owner_email,
          {
            redirectTo: `${siteUrl}/auth/callback?next=/portal`,
            data: { salon_id: salon.id, role: "SALON_OWNER" },
          }
        )
        if (inviteError) console.error("Invite gönderilemedi:", inviteError)
        else if (inviteData?.user) userId = inviteData.user.id
      }

      if (userId) {
        await adminClient.from("profiles").upsert({
          id: userId,
          email: owner_email,
          role: "SALON_OWNER",
          salon_id: salon.id,
        })
      }
    } catch (e) {
      console.error("Salon sahibi oluşturulamadı:", e)
      // Don't fail the salon creation if owner setup fails
    }
  }

  return NextResponse.json({ data: salon })
}
