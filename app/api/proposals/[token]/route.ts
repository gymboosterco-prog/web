import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const admin = createAdminClient()

    const { data: proposal, error } = await admin
      .from("proposals")
      .select("*, leads(name, gym_name)")
      .eq("token", token)
      .maybeSingle()

    if (error || !proposal) {
      return NextResponse.json({ error: "Teklif bulunamadı" }, { status: 404 })
    }

    // Mark as viewed on first open after being sent
    if (proposal.status === "sent") {
      await admin
        .from("proposals")
        .update({ status: "viewed", viewed_at: new Date().toISOString() })
        .eq("token", token)
      proposal.status = "viewed"
    }

    return NextResponse.json({ proposal })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { action } = await request.json()

    if (action !== "accept") {
      return NextResponse.json({ error: "Geçersiz aksiyon" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: proposal, error } = await admin
      .from("proposals")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("token", token)
      .not("status", "eq", "accepted")
      .not("status", "eq", "rejected")
      .select("*, leads(name, gym_name, phone)")
      .maybeSingle()

    if (error || !proposal) {
      return NextResponse.json({ error: "Teklif kabul edilemedi veya zaten işlem yapılmış" }, { status: 400 })
    }

    // Notify admin team
    const rawLead = proposal.leads
    const lead = (Array.isArray(rawLead) ? rawLead[0] : rawLead) as { name: string; gym_name: string; phone: string } | null
    console.log("[proposal-accept] lead data:", JSON.stringify(lead))
    console.log("[proposal-accept] RESEND_API_KEY set:", !!process.env.RESEND_API_KEY)

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const result = await resend.emails.send({
        from: "Gymbooster <onboarding@resend.dev>",
        to: "gymboosterco@gmail.com",
        subject: `✅ Teklif Kabul Edildi: ${lead?.name ?? "-"} — ${lead?.gym_name ?? "-"}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e5e5e5;border-radius:12px;">
            <h1 style="color:#f2ff00;font-size:22px;margin:0 0 16px;">✅ Teklif Kabul Edildi!</h1>
            <div style="background:#1a1a1a;border-radius:8px;padding:20px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#888;padding:6px 0;width:130px;">Müşteri</td><td style="color:#fff;font-weight:600;">${lead?.name ?? "-"}</td></tr>
                <tr><td style="color:#888;padding:6px 0;">Salon</td><td style="color:#fff;font-weight:600;">${lead?.gym_name ?? "-"}</td></tr>
                <tr><td style="color:#888;padding:6px 0;">Telefon</td><td style="color:#f2ff00;font-weight:600;">${lead?.phone ?? "-"}</td></tr>
                <tr><td style="color:#888;padding:6px 0;">Aylık Ücret</td><td style="color:#fff;font-weight:600;">₺${proposal.monthly_fee}</td></tr>
                <tr><td style="color:#888;padding:6px 0;">Süre</td><td style="color:#fff;font-weight:600;">${proposal.contract_months} ay</td></tr>
              </table>
            </div>
            <div style="text-align:center;margin-top:20px;">
              <a href="https://www.gymbooster.tr/admin" style="display:inline-block;background:#f2ff00;color:#000;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none;">Admin Panele Git →</a>
            </div>
          </div>`,
      })
      console.log("[proposal-accept] resend result:", JSON.stringify(result))
    } catch (e: any) {
      console.error("[proposal-accept] email error:", e?.message ?? e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}
