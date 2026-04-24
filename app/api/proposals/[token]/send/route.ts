import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile || !["ADMIN", "STAFF"].includes(profile.role ?? "")) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    const { token } = await params
    const admin = createAdminClient()

    const { data: proposal, error } = await admin
      .from("proposals")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("token", token)
      .select("*, leads(name, gym_name, phone)")
      .maybeSingle()

    if (error || !proposal) {
      return NextResponse.json({ error: "Teklif bulunamadı" }, { status: 404 })
    }

    const lead = proposal.leads as { name: string; gym_name: string; phone: string } | null
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gymbooster.tr"
    const proposalUrl = `${base}/teklif/${token}`
    const servicesList = (proposal.services as string[]).map((s: string) => `<li style="margin:4px 0;">${s}</li>`).join("")

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "Gymbooster <onboarding@resend.dev>",
        to: ["gymboosterco@gmail.com", "furkantture@gmail.com"],
        subject: `📋 Teklif Gönderildi: ${lead?.name ?? ""} — ${lead?.gym_name ?? ""}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e5e5e5;border-radius:12px;">
            <h1 style="color:#f2ff00;font-size:22px;margin:0 0 8px;">Gymbooster — Özel Teklifiniz</h1>
            <p style="color:#888;margin:0 0 24px;">Sayın ${lead?.name ?? "Değerli Müşterimiz"},</p>
            <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:16px;">
              <h2 style="color:#fff;font-size:16px;margin:0 0 12px;">Hizmetler</h2>
              <ul style="color:#e5e5e5;padding-left:20px;margin:0;">${servicesList}</ul>
            </div>
            <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:20px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#888;padding:6px 0;width:140px;">Aylık Ücret</td><td style="color:#f2ff00;font-weight:700;font-size:20px;">₺${proposal.monthly_fee}</td></tr>
                ${proposal.setup_fee ? `<tr><td style="color:#888;padding:6px 0;">Kurulum Ücreti</td><td style="color:#fff;font-weight:600;">₺${proposal.setup_fee} (tek seferlik)</td></tr>` : ""}
                <tr><td style="color:#888;padding:6px 0;">Sözleşme Süresi</td><td style="color:#fff;font-weight:600;">${proposal.contract_months} ay</td></tr>
                ${proposal.valid_until ? `<tr><td style="color:#888;padding:6px 0;">Geçerlilik</td><td style="color:#fff;font-weight:600;">${new Date(proposal.valid_until).toLocaleDateString("tr-TR")}</td></tr>` : ""}
              </table>
            </div>
            ${proposal.notes ? `<p style="color:#888;font-size:14px;padding:12px;border:1px solid #333;border-radius:8px;">${proposal.notes}</p>` : ""}
            <div style="text-align:center;margin-top:24px;">
              <a href="${proposalUrl}" style="display:inline-block;background:#f2ff00;color:#000;font-weight:700;padding:14px 40px;border-radius:8px;text-decoration:none;font-size:16px;">Teklifi İncele ve Kabul Et →</a>
            </div>
            <p style="color:#555;font-size:12px;text-align:center;margin-top:24px;">Gymbooster — Spor Salonlarına Özel Reklam Ajansı</p>
          </div>
        `,
      })
    } catch (e) {
      console.error("Email gönderilemedi:", e)
    }

    return NextResponse.json({ success: true, url: proposalUrl })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}
