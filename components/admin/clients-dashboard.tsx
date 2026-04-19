"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Zap, TrendingUp, Users, AlertCircle, Pencil, Check, X, Plus } from "lucide-react"
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

const emptyNew = { name: "", gym_name: "", phone: "", instagram_url: "", monthly_fee: "", payment_day: "", client_start_date: "" }

export function ClientsDashboard({ leads }: { leads: Client[] }) {
  const supabase = createClient()
  const clients = useMemo(() => leads.filter(l => (l as any).status === 'won'), [leads])
  const [localClients, setLocalClients] = useState<Client[]>(clients)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<EditState>({ monthly_fee: "", payment_day: "", client_start_date: "" })
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newForm, setNewForm] = useState(emptyNew)
  const [adding, setAdding] = useState(false)

  useEffect(() => { setLocalClients(clients) }, [clients])

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

  async function addClient() {
    if (!newForm.name.trim() || !newForm.phone.trim() || !newForm.gym_name.trim()) {
      toast.error("Ad, telefon ve salon adı zorunlu")
      return
    }
    setAdding(true)
    const record = {
      name: newForm.name.trim(),
      gym_name: newForm.gym_name.trim(),
      phone: newForm.phone.trim(),
      instagram_url: newForm.instagram_url.trim() || null,
      monthly_fee: newForm.monthly_fee ? parseFloat(newForm.monthly_fee) : null,
      payment_day: newForm.payment_day ? parseInt(newForm.payment_day) : null,
      client_start_date: newForm.client_start_date || null,
      status: "won",
      source: "manual",
      won_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from("leads").insert([record]).select().single()
    if (error) {
      toast.error("Eklenemedi", { description: error.message })
    } else {
      setLocalClients(prev => [data as Client, ...prev])
      toast.success(`${record.gym_name} eklendi`)
      setShowAddModal(false)
      setNewForm(emptyNew)
    }
    setAdding(false)
  }

  const addButton = (
    <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
      <Plus className="w-4 h-4" />
      Müşteri Ekle
    </Button>
  )

  return (
    <main className="container px-4 py-8 space-y-6">
      {/* Summary Cards */}
      <div className="flex items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
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
        <div className="shrink-0">{addButton}</div>
      </div>

      {/* Empty state */}
      {localClients.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">Henüz aktif müşteri yok</p>
          <p className="text-sm mb-4">Lead'leri "Ödeme Alındı (Won)" statüsüne alınca veya manuel ekleyince burada görünür.</p>
        </div>
      )}

      {/* Clients Table */}
      {localClients.length > 0 && (
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
                      <td className="p-4">
                        {isEditing ? (
                          <Input type="number" value={editValues.monthly_fee} onChange={e => setEditValues(v => ({ ...v, monthly_fee: e.target.value }))} placeholder="15000" className="h-8 w-28 text-sm" />
                        ) : (
                          <span className="font-semibold text-primary">{formatFee(client.monthly_fee)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input type="number" min={1} max={28} value={editValues.payment_day} onChange={e => setEditValues(v => ({ ...v, payment_day: e.target.value }))} placeholder="15" className="h-8 w-20 text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{client.payment_day ? `Her ayın ${client.payment_day}'i` : "—"}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input type="date" value={editValues.client_start_date} onChange={e => setEditValues(v => ({ ...v, client_start_date: e.target.value }))} className="h-8 w-36 text-sm [color-scheme:dark]" />
                        ) : (
                          <span className="text-muted-foreground">{formatDate(client.client_start_date)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.urgent && <Zap className="w-3 h-3" />}
                          {status.label}
                        </span>
                      </td>
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
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold">Yeni Müşteri Ekle</h2>
              <Button size="icon" variant="ghost" onClick={() => setShowAddModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Salon Adı *</label>
                  <Input value={newForm.gym_name} onChange={e => setNewForm(v => ({ ...v, gym_name: e.target.value }))} placeholder="Alpfit Spor Merkezi" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ad Soyad *</label>
                  <Input value={newForm.name} onChange={e => setNewForm(v => ({ ...v, name: e.target.value }))} placeholder="Ahmet Yılmaz" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Telefon *</label>
                  <Input value={newForm.phone} onChange={e => setNewForm(v => ({ ...v, phone: e.target.value }))} placeholder="+90 532 000 00 00" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Aylık Ücret (₺)</label>
                  <Input type="number" value={newForm.monthly_fee} onChange={e => setNewForm(v => ({ ...v, monthly_fee: e.target.value }))} placeholder="15000" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ödeme Günü (1–28)</label>
                  <Input type="number" min={1} max={28} value={newForm.payment_day} onChange={e => setNewForm(v => ({ ...v, payment_day: e.target.value }))} placeholder="15" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Başlangıç Tarihi</label>
                  <Input type="date" value={newForm.client_start_date} onChange={e => setNewForm(v => ({ ...v, client_start_date: e.target.value }))} className="[color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Instagram</label>
                  <Input value={newForm.instagram_url} onChange={e => setNewForm(v => ({ ...v, instagram_url: e.target.value }))} placeholder="@salon" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 pt-0">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>İptal</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={addClient} disabled={adding}>
                {adding ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
