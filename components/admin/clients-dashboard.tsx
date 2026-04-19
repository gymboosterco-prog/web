"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Zap, TrendingUp, Users, AlertCircle, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type Client = {
  id: string
  name: string
  gym_name: string
  phone: string
  instagram_url: string | null
  monthly_fee: number | null
  payment_day: number | null
  client_start_date: string | null
  won_at: string | null
}

function paymentStatus(paymentDay: number | null): { label: string; color: string; urgent: boolean } {
  if (!paymentDay) return { label: "Gün girilmedi", color: "bg-secondary text-muted-foreground", urgent: false }
  const today = new Date().getDate()
  const diff = paymentDay - today
  if (diff === 0) return { label: "BUGÜN ⚡", color: "bg-red-500/20 text-red-400 border border-red-500/30", urgent: true }
  if (diff > 0 && diff <= 3) return { label: `${diff} gün kaldı`, color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", urgent: true }
  if (diff < 0 && diff >= -3) return { label: `${Math.abs(diff)} gün geçti`, color: "bg-orange-500/20 text-orange-400 border border-orange-500/30", urgent: false }
  return { label: `Her ayın ${paymentDay}'i`, color: "bg-secondary text-muted-foreground", urgent: false }
}

function formatFee(fee: number | null) {
  if (!fee) return "—"
  return `₺${fee.toLocaleString("tr-TR")}`
}

function formatDate(date: string | null) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

type EditState = { monthly_fee: string; payment_day: string; client_start_date: string }

export function ClientsDashboard({
  leads,
}: {
  leads: Client[]
}) {
  const supabase = createClient()
  const clients = useMemo(() => leads.filter(l => (l as any).status === 'won'), [leads])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<EditState>({ monthly_fee: "", payment_day: "", client_start_date: "" })
  const [saving, setSaving] = useState(false)
  const [localClients, setLocalClients] = useState<Client[]>(clients)

  useEffect(() => { setLocalClients(clients) }, [clients])

  // Browser notification on mount for today's payments
  useEffect(() => {
    const today = new Date().getDate()
    const dueToday = localClients.filter(c => c.payment_day === today)
    if (dueToday.length > 0 && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(`⚡ ${dueToday.length} Müşteri Bugün Ödeme Yapacak`, {
        body: dueToday.map(c => c.gym_name).join(", "),
        icon: "/icon-192.png"
      })
    }
  }, [])

  const totalMonthlyRevenue = useMemo(
    () => localClients.reduce((sum, c) => sum + (c.monthly_fee ?? 0), 0),
    [localClients]
  )
  const urgentCount = useMemo(() => {
    const today = new Date().getDate()
    return localClients.filter(c => c.payment_day !== null && Math.abs((c.payment_day ?? 0) - today) <= 3).length
  }, [localClients])

  function startEdit(client: Client) {
    setEditingId(client.id)
    setEditValues({
      monthly_fee: client.monthly_fee?.toString() ?? "",
      payment_day: client.payment_day?.toString() ?? "",
      client_start_date: client.client_start_date ?? "",
    })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const updates = {
      monthly_fee: editValues.monthly_fee ? parseFloat(editValues.monthly_fee) : null,
      payment_day: editValues.payment_day ? parseInt(editValues.payment_day) : null,
      client_start_date: editValues.client_start_date || null,
    }
    const { error } = await supabase.from("leads").update(updates).eq("id", id)
    if (error) {
      toast.error("Kaydedilemedi", { description: error.message })
    } else {
      setLocalClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
      toast.success("Kaydedildi")
      setEditingId(null)
    }
    setSaving(false)
  }

  if (localClients.length === 0) {
    return (
      <main className="container px-4 py-12 text-center text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Henüz aktif müşteri yok</p>
        <p className="text-sm mt-1">Lead'leri "Ödeme Alındı (Won)" statüsüne alınca burada görünür.</p>
      </main>
    )
  }

  return (
    <main className="container px-4 py-8 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            Toplam Aylık Gelir
          </div>
          <div className="text-3xl font-bold text-primary">
            {totalMonthlyRevenue > 0 ? `₺${totalMonthlyRevenue.toLocaleString("tr-TR")}` : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Users className="w-4 h-4" />
            Aktif Müşteri
          </div>
          <div className="text-3xl font-bold">{localClients.length}</div>
        </div>
        <div className={`rounded-xl border bg-card p-5 ${urgentCount > 0 ? "border-yellow-500/40" : "border-border"}`}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <AlertCircle className={`w-4 h-4 ${urgentCount > 0 ? "text-yellow-500" : ""}`} />
            Ödeme Yaklaşıyor
          </div>
          <div className={`text-3xl font-bold ${urgentCount > 0 ? "text-yellow-500" : ""}`}>{urgentCount}</div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Müşteri</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Aylık Ücret</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Ödeme Günü</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Başlangıç</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Durum</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {localClients.map(client => {
                const status = paymentStatus(client.payment_day)
                const isEditing = editingId === client.id
                return (
                  <tr key={client.id} className={`border-b border-border last:border-0 transition-colors ${status.urgent ? "bg-yellow-500/5" : ""}`}>
                    {/* Müşteri */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-sm">{client.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{client.gym_name}</p>
                          <p className="text-xs text-muted-foreground">{client.name}</p>
                          <a href={`tel:${client.phone}`} className="text-[10px] text-primary hover:underline">{client.phone}</a>
                        </div>
                      </div>
                    </td>

                    {/* Aylık Ücret */}
                    <td className="p-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.monthly_fee}
                          onChange={e => setEditValues(v => ({ ...v, monthly_fee: e.target.value }))}
                          placeholder="15000"
                          className="h-8 w-28 text-sm"
                        />
                      ) : (
                        <span className="font-semibold text-primary">{formatFee(client.monthly_fee)}</span>
                      )}
                    </td>

                    {/* Ödeme Günü */}
                    <td className="p-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          min={1}
                          max={28}
                          value={editValues.payment_day}
                          onChange={e => setEditValues(v => ({ ...v, payment_day: e.target.value }))}
                          placeholder="15"
                          className="h-8 w-20 text-sm"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {client.payment_day ? `Her ayın ${client.payment_day}'i` : "—"}
                        </span>
                      )}
                    </td>

                    {/* Başlangıç */}
                    <td className="p-4">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editValues.client_start_date}
                          onChange={e => setEditValues(v => ({ ...v, client_start_date: e.target.value }))}
                          className="h-8 w-36 text-sm [color-scheme:dark]"
                        />
                      ) : (
                        <span className="text-muted-foreground">{formatDate(client.client_start_date)}</span>
                      )}
                    </td>

                    {/* Ödeme Durumu */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        {status.urgent && <Zap className="w-3 h-3" />}
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:bg-green-500/10" onClick={() => saveEdit(client.id)} disabled={saving}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:bg-secondary" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEdit(client)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
