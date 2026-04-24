import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { CopyButton } from "./copy-button"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:    { label: "Taslak",   color: "bg-white/10 text-white/50" },
  sent:     { label: "Gönderildi", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  viewed:   { label: "Görüntülendi", color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" },
  accepted: { label: "Kabul Edildi ✅", color: "bg-green-500/10 text-green-400 border border-green-500/20" },
  rejected: { label: "Reddedildi", color: "bg-red-500/10 text-red-400 border border-red-500/20" },
}

export default async function TekliflerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || !["ADMIN", "STAFF"].includes(profile.role ?? "")) redirect("/portal")

  const admin = createAdminClient()
  const { data: proposals } = await admin
    .from("proposals")
    .select("*, leads(name, gym_name, phone)")
    .order("created_at", { ascending: false })

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gymbooster.tr"

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Teklifler</h1>
        <p className="text-muted-foreground text-sm mt-1">{proposals?.length ?? 0} teklif</p>
      </div>

      {!proposals?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-medium">Henüz teklif oluşturulmadı.</p>
          <p className="text-sm mt-1">Lead detay panelinden "Teklif Oluştur" butonunu kullanın.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Salon / Müşteri</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aylık</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kurulum</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Süre</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tarih</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => {
                const lead = p.leads as { name: string; gym_name: string; phone: string } | null
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.draft
                const url = `${base}/teklif/${p.token}`
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{lead?.gym_name ?? "—"}</p>
                      <p className="text-muted-foreground text-xs">{lead?.name}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      ₺{Number(p.monthly_fee).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.setup_fee > 0 ? `₺${Number(p.setup_fee).toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.contract_months} ay</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {p.accepted_at && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(p.accepted_at).toLocaleDateString("tr-TR")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CopyButton url={url} />
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

