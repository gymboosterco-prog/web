import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile || !["ADMIN", "STAFF"].includes(profile.role ?? "")) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    const body = await request.json()
    const { lead_id, services, monthly_fee, original_price, setup_fee, contract_months, valid_until, notes } = body

    if (!lead_id || !monthly_fee) {
      return NextResponse.json({ error: "lead_id ve monthly_fee zorunlu" }, { status: 400 })
    }
    if (typeof monthly_fee !== "number" || monthly_fee <= 0) {
      return NextResponse.json({ error: "Geçersiz aylık ücret" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: proposal, error } = await admin
      .from("proposals")
      .insert({
        lead_id,
        services: services ?? [],
        monthly_fee,
        original_price: original_price ?? null,
        setup_fee: setup_fee ?? 0,
        contract_months: contract_months ?? 3,
        valid_until: valid_until ?? null,
        notes: notes ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Teklif oluşturulamadı" }, { status: 500 })
    }

    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gymbooster.tr"
    return NextResponse.json({
      proposal,
      url: `${base}/teklif/${proposal.token}`,
    })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile || !["ADMIN", "STAFF"].includes(profile.role ?? "")) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const lead_id = searchParams.get("lead_id")

    const admin = createAdminClient()
    let query = admin
      .from("proposals")
      .select("*, leads(name, gym_name, phone)")
      .order("created_at", { ascending: false })

    if (lead_id) query = query.eq("lead_id", lead_id)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: "Teklifler getirilemedi" }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}
