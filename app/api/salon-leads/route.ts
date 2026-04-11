import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { salon_id, name, phone, email, instagram_url } = body

    if (!salon_id || !name || !phone) {
      return NextResponse.json({ error: "salon_id, ad ve telefon zorunlu" }, { status: 400 })
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Ad en az 2 karakter olmalı" }, { status: 400 })
    }
    if (typeof phone !== "string" || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Geçersiz telefon numarası" }, { status: 400 })
    }

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

    const supabase = await createClient()

    // Verify salon exists
    const { data: salon } = await supabase.from("salons").select("id, name").eq("id", salon_id).eq("active", true).maybeSingle()
    if (!salon) return NextResponse.json({ error: "Salon bulunamadı" }, { status: 404 })

    const { error } = await supabase.from("salon_leads").insert([{
      salon_id,
      name: escape(name.trim()),
      phone: escape(phone.trim()),
      email: email ? escape(email.trim()) : null,
      instagram_url: instagram_url ? escape(instagram_url.trim().replace(/^@/, "")) : null,
      status: "new",
      source: "website",
    }])

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role, salon_id").eq("id", user.id).maybeSingle()
    if (!profile) return NextResponse.json({ error: "Profil bulunamadı" }, { status: 403 })

    let query = supabase.from("salon_leads").select("*", { count: "exact" }).order("created_at", { ascending: false })

    // SALON_OWNER: only their salon's leads (RLS handles this, but extra safety)
    if (profile.role === "SALON_OWNER" && profile.salon_id) {
      query = query.eq("salon_id", profile.salon_id)
    }

    const { data, error, count } = await query.range(0, 99)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, total: count ?? 0 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}
