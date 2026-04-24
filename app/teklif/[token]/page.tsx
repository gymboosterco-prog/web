import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { CheckCircle2, XCircle, Shield, Clock } from "lucide-react"
import { AcceptButton } from "./accept-button"

export const dynamic = "force-dynamic"

const NOT_INCLUDED = [
  "Reklam bütçesi (sizin hesabınızdan harcanır)",
  "Video çekimi (danışmanlık yapıyoruz, çekim yapmıyoruz)",
]

type Props = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const admin = createAdminClient()
  const { data } = await admin.from("proposals").select("leads(gym_name)").eq("token", token).maybeSingle()
  const lead = (Array.isArray(data?.leads) ? data.leads[0] : data?.leads) as { gym_name: string } | null
  return {
    title: `Gymbooster Teklifiniz${lead ? ` — ${lead.gym_name}` : ""}`,
    robots: { index: false, follow: false },
  }
}

export default async function TeklifPage({ params }: Props) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: proposal } = await admin
    .from("proposals")
    .select("*, leads(name, gym_name)")
    .eq("token", token)
    .maybeSingle()

  if (!proposal) notFound()

  if (proposal.status === "sent") {
    await admin
      .from("proposals")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("token", token)
  }

  const lead = proposal.leads as { name: string; gym_name: string } | null
  const services = (proposal.services ?? []) as string[]
  const isAccepted = proposal.status === "accepted"
  const originalPrice = proposal.original_price as number | null
  const monthlyFee = Number(proposal.monthly_fee)
  const hasDiscount = originalPrice && originalPrice > monthlyFee
  const discountPct = hasDiscount ? Math.round((1 - monthlyFee / originalPrice) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(242,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(242,255,0,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(242,255,0,0.06), transparent 40%)" }} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Gymbooster" width={160} height={48} className="h-10 w-auto" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f2ff00" }}>
            Özel Teklifiniz
          </p>
          <h1 className="text-3xl font-bold mb-2">{lead?.gym_name ?? "Değerli Müşterimiz"}</h1>
          <p className="text-white/50 text-sm">Sayın {lead?.name}</p>
        </div>

        {isAccepted ? (
          <div className="bg-white/[0.04] border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xl font-bold mb-2">Bu teklif kabul edilmiştir.</p>
            <p className="text-white/50 text-sm">Ekibimiz sizinle iletişime geçecektir.</p>
          </div>
        ) : (
          <>
            {/* Included Services */}
            {services.length > 0 && (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">✅ Pakete Dahil</h2>
                <div className="space-y-2.5">
                  {services.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(242,255,0,0.1)", border: "1px solid rgba(242,255,0,0.3)" }}>
                        <CheckCircle2 className="w-3 h-3" style={{ color: "#f2ff00" }} />
                      </div>
                      <span className="text-sm leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not Included */}
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">❌ Dahil Olmayanlar</h2>
              <div className="space-y-2.5">
                {NOT_INCLUDED.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-red-500/10 border border-red-500/20">
                      <XCircle className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-sm text-white/50 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-5">Fiyatlandırma</h2>

              {hasDiscount && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-sm">Normal Fiyat</span>
                  <span className="text-white/40 text-base line-through">
                    ₺{Number(originalPrice).toLocaleString("tr-TR")}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-white/60 text-sm">{hasDiscount ? "Özel Fiyat" : "Aylık Ücret"}</span>
                  {hasDiscount && (
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(242,255,0,0.15)", color: "#f2ff00", border: "1px solid rgba(242,255,0,0.3)" }}>
                      %{discountPct} indirim
                    </span>
                  )}
                </div>
                <span className="text-3xl font-black" style={{ color: "#f2ff00" }}>
                  ₺{monthlyFee.toLocaleString("tr-TR")}
                </span>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                {proposal.setup_fee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Kurulum Ücreti <span className="text-xs text-white/40">(tek seferlik)</span></span>
                    <span className="text-sm font-semibold">₺{Number(proposal.setup_fee).toLocaleString("tr-TR")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Sözleşme Süresi</span>
                  <span className="text-sm font-semibold">{proposal.contract_months} ay</span>
                </div>
                {proposal.valid_until && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Geçerlilik Tarihi</span>
                    <span className="text-sm font-semibold">
                      {new Date(proposal.valid_until).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {proposal.notes && (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-4">
                <p className="text-white/60 text-sm leading-relaxed">{proposal.notes}</p>
              </div>
            )}

            {/* CTA */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6">
              <AcceptButton token={token} />
            </div>

            {/* Trust */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center text-white/40 text-xs">
              {[
                { icon: Clock, text: "24 saat içinde aranırsınız" },
                { icon: Shield, text: "Güvenli ve bağlayıcı" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center justify-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(242,255,0,0.5)" }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-white/20 text-xs mt-8">
          Powered by <span className="text-white/40">Gymbooster</span>
        </p>
      </div>
    </div>
  )
}
