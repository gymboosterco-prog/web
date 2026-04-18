import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, instagramUrl, adBudget, preferredCallTime } = body

    if (!name || !phone || !instagramUrl) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur" },
        { status: 400 }
      )
    }

    // Validate field formats
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Ad en az 2 karakter olmalıdır" }, { status: 400 })
    }
    if (typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: "Geçersiz telefon numarası" }, { status: 400 })
    }
    if (typeof instagramUrl !== 'string' || instagramUrl.trim().length < 2) {
      return NextResponse.json({ error: "Geçerli bir Instagram kullanıcı adı girin" }, { status: 400 })
    }

    // Sanitize for HTML output (email template)
    const escapeHtml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const safeName = escapeHtml(name.trim())
    const safeInstagram = escapeHtml(instagramUrl.trim().replace(/^@/, ''))
    const safeGymName = `@${safeInstagram}`
    const safePhone = escapeHtml(phone.trim())
    const safeAdBudget = adBudget ? escapeHtml(String(adBudget)) : null
    const safeCallTime = preferredCallTime ? escapeHtml(String(preferredCallTime)) : null

    const supabase = await createClient()

    const { error } = await supabase
      .from("leads")
      .insert([
        {
          name: safeName,
          phone: safePhone,
          gym_name: safeGymName,
          instagram_url: safeInstagram || null,
          ad_budget: safeAdBudget,
          preferred_call_time: safeCallTime,
          status: "new",
          source: "website"
        }
      ])


    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: `Supabase hatası: ${error.message || "Bilinmeyen hata"}` },
        { status: 500 }
      )
    }

    // E-posta bildirimi gönder (hata lead kaydını engellemez)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "Gymbooster <onboarding@resend.dev>",
        to: ["gymboosterco@gmail.com", "furkantture@gmail.com"],
        subject: `🚀 Yeni Lead: ${safeName} - ${safeGymName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e5e5e5;border-radius:12px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#f2ff00;font-size:24px;margin:0;">Gymbooster</h1>
              <p style="color:#888;margin:4px 0 0;">Yeni Müşteri Adayı</p>
            </div>
            <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:16px;">
              <h2 style="color:#fff;font-size:18px;margin:0 0 16px;">📋 Lead Bilgileri</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#888;padding:6px 0;width:130px;">Ad Soyad</td><td style="color:#fff;font-weight:600;">${safeName}</td></tr>
                <tr><td style="color:#888;padding:6px 0;">Instagram</td><td style="color:#fff;font-weight:600;">@${safeInstagram}</td></tr>
                <tr><td style="color:#888;padding:6px 0;">Telefon</td><td style="color:#f2ff00;font-weight:600;">${safePhone}</td></tr>
                ${safeAdBudget ? `<tr><td style="color:#888;padding:6px 0;">Reklam Bütçesi</td><td style="color:#fff;font-weight:600;">₺${safeAdBudget.replace('-', ' – ₺')}</td></tr>` : ''}
                ${safeCallTime ? `<tr><td style="color:#888;padding:6px 0;">Aranma Saati</td><td style="color:#fff;font-weight:600;">${safeCallTime}</td></tr>` : ''}
              </table>
            </div>
            <div style="text-align:center;">
              <a href="https://www.gymbooster.tr/admin" style="display:inline-block;background:#f2ff00;color:#000;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none;">Dashboard'a Git →</a>
            </div>
            <p style="color:#555;font-size:12px;text-align:center;margin-top:24px;">Gymbooster Lead Yönetim Sistemi</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("E-posta gönderilemedi:", emailError)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("API error:", error)
    
    // Check if it's our configuration error
    if (error.message?.includes("Supabase URL ve Anon Key")) {
      return NextResponse.json(
        { error: "Sistem yapılandırma hatası: Supabase anahtarları eksik." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check for authentication and role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile || !["ADMIN", "STAFF"].includes(profile.role || "")) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    const { data, error, count } = await supabase
      .from("leads")
      .select("*", { count: 'exact' })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Leads getirilemedi" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, total: count ?? 0 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
