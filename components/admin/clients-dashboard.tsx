"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import {
  TrendingUp, Users, AlertCircle, Pencil, Check, X, Plus,
  History, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────
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

type PaymentRecord = {
  id: string
  lead_id: string
  month: string        // 'YYYY-MM'
  status: 'paid' | 'pending' | 'overdue'
  amount: number | null
  paid_at: string | null
  notes: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function currentMonth() { return new Date().toISOString().slice(0, 7) }

function monthLabel(m: string) {
  const [y, mo] = m.split('-')
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}

function monthsSince(startDate: string | null): string[] {
  const start = startDate ? new Date(startDate) : new Date()
  const now = new Date()
  const months: string[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= now) {
    months.unshift(cur.toISOString().slice(0, 7))
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

function computeStatus(paymentDay: number | null, month: string, record?: PaymentRecord): 'paid' | 'pending' | 'overdue' {
  if (record) return record.status
  if (!paymentDay) return 'pending'
  const [y, mo] = month.split('-').map(Number)
  const paymentDate = new Date(y, mo - 1, paymentDay)
  return paymentDate < new Date() ? 'overdue' : 'pending'
}

const STATUS_CONFIG = {
  paid:    { label: 'Ödendi ✓',  color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  pending: { label: 'Bekliyor',  color: 'bg-secondary text-muted-foreground' },
  overdue: { label: 'Gecikti ⚠', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
}

function formatFee(fee: number | null) {
  return fee ? `₺${fee.toLocaleString('tr-TR')}` : '—'
}
function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

type EditState = { monthly_fee: string; payment_day: string; client_start_date: string }
const emptyNew = { name: '', gym_name: '', phone: '', instagram_url: '', monthly_fee: '', payment_day: '', client_start_date: '' }

// ─── Component ────────────────────────────────────────────────────────────────
export function ClientsDashboard({ leads }: { leads: Client[] }) {
  const supabase = createClient()
  const clients = useMemo(() => leads.filter(l => (l as any).status === 'won'), [leads])

  const [localClients, setLocalClients] = useState<Client[]>(clients)
  const [payments, setPayments] = useState<Record<string, PaymentRecord[]>>({})  // keyed by lead_id

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<EditState>({ monthly_fee: '', payment_day: '', client_start_date: '' })
  const [saving, setSaving] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newForm, setNewForm] = useState(emptyNew)
  const [adding, setAdding] = useState(false)

  const [historyClient, setHistoryClient] = useState<Client | null>(null)
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Sync local clients when parent leads change
  useEffect(() => { setLocalClients(clients) }, [clients])

  // Fetch all payment records
  const fetchPayments = useCallback(async () => {
    const ids = localClients.map(c => c.id)
    if (!ids.length) return
    const { data } = await supabase.from('client_payments').select('*').in('lead_id', ids)
    if (data) {
      const grouped: Record<string, PaymentRecord[]> = {}
      for (const p of data as PaymentRecord[]) {
        if (!grouped[p.lead_id]) grouped[p.lead_id] = []
        grouped[p.lead_id].push(p)
      }
      setPayments(grouped)
    }
  }, [localClients])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  // Browser notification for today's payments
  useEffect(() => {
    const today = new Date().getDate()
    const dueToday = localClients.filter(c => c.payment_day === today)
    if (dueToday.length > 0 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`⚡ ${dueToday.length} Müşteri Bugün Ödeme Yapacak`, {
        body: dueToday.map(c => c.gym_name).join(', '),
        icon: '/icon-192.png'
      })
    }
  }, [])

  const totalMonthlyRevenue = useMemo(
    () => localClients.reduce((sum, c) => sum + (c.monthly_fee ?? 0), 0),
    [localClients]
  )
  const urgentCount = useMemo(() => {
    const cm = currentMonth()
    return localClients.filter(c => {
      const rec = payments[c.id]?.find(p => p.month === cm)
      return computeStatus(c.payment_day, cm, rec) === 'overdue'
    }).length
  }, [localClients, payments])

  // ── Edit ──
  function startEdit(client: Client) {
    setEditingId(client.id)
    setEditValues({
      monthly_fee: client.monthly_fee?.toString() ?? '',
      payment_day: client.payment_day?.toString() ?? '',
      client_start_date: client.client_start_date ?? '',
    })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const updates = {
      monthly_fee: editValues.monthly_fee ? parseFloat(editValues.monthly_fee) : null,
      payment_day: editValues.payment_day ? parseInt(editValues.payment_day) : null,
      client_start_date: editValues.client_start_date || null,
    }
    const { error } = await supabase.from('leads').update(updates).eq('id', id)
    if (error) { toast.error('Kaydedilemedi', { description: error.message }) }
    else {
      setLocalClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
      toast.success('Kaydedildi')
      setEditingId(null)
    }
    setSaving(false)
  }

  // ── Mark as paid ──
  async function markPaid(client: Client, month: string) {
    const key = `${client.id}-${month}`
    setMarkingPaid(key)
    const record = {
      lead_id: client.id,
      month,
      status: 'paid' as const,
      amount: client.monthly_fee,
      paid_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('client_payments')
      .upsert([record], { onConflict: 'lead_id,month' })
      .select()
      .single()
    if (error) { toast.error('İşaretlenemedi', { description: error.message }) }
    else {
      setPayments(prev => {
        const list = (prev[client.id] ?? []).filter(p => p.month !== month)
        return { ...prev, [client.id]: [...list, data as PaymentRecord] }
      })
      toast.success(`${monthLabel(month)} ödemesi kaydedildi`)
    }
    setMarkingPaid(null)
  }

  // ── Add client ──
  async function addClient() {
    if (!newForm.name.trim() || !newForm.phone.trim() || !newForm.gym_name.trim()) {
      toast.error('Ad, telefon ve salon adı zorunlu')
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
      status: 'won',
      source: 'manual',
      won_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('leads').insert([record]).select().single()
    if (error) { toast.error('Eklenemedi', { description: error.message }) }
    else {
      setLocalClients(prev => [data as Client, ...prev])
      toast.success(`${record.gym_name} eklendi`)
      setShowAddModal(false)
      setNewForm(emptyNew)
    }
    setAdding(false)
  }

  // ── Delete client ──
  async function deleteClient(id: string) {
    setDeleting(true)
    const { error } = await supabase.from('leads').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.error('Silinemedi', { description: error.message }) }
    else {
      setLocalClients(prev => prev.filter(c => c.id !== id))
      toast.success('Müşteri pasife alındı')
      setDeleteConfirmId(null)
    }
    setDeleting(false)
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  const cm = currentMonth()

  return (
    <main className="container px-4 py-8 space-y-6">
      {/* Summary row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="grid grid-cols-3 gap-4 flex-1 w-full">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Aylık Gelir
            </div>
            <div className="text-2xl font-bold text-primary">
              {totalMonthlyRevenue > 0 ? `₺${totalMonthlyRevenue.toLocaleString('tr-TR')}` : '—'}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Users className="w-3.5 h-3.5" /> Aktif Müşteri
            </div>
            <div className="text-2xl font-bold">{localClients.length}</div>
          </div>
          <div className={`rounded-xl border bg-card p-4 ${urgentCount > 0 ? 'border-red-500/40' : 'border-border'}`}>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <AlertCircle className={`w-3.5 h-3.5 ${urgentCount > 0 ? 'text-red-500' : ''}`} /> Gecikmiş
            </div>
            <div className={`text-2xl font-bold ${urgentCount > 0 ? 'text-red-500' : ''}`}>{urgentCount}</div>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="shrink-0 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="w-4 h-4" /> Müşteri Ekle
        </Button>
      </div>

      {/* Empty */}
      {localClients.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">Henüz aktif müşteri yok</p>
          <p className="text-sm">Lead'leri "Ödeme Alındı (Won)" statüsüne alınca veya manuel ekleyince burada görünür.</p>
        </div>
      )}

      {/* Table */}
      {localClients.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                  <th className="text-left p-4 font-medium">Müşteri</th>
                  <th className="text-left p-4 font-medium">Aylık Ücret</th>
                  <th className="text-left p-4 font-medium">Ödeme Günü</th>
                  <th className="text-left p-4 font-medium">Başlangıç</th>
                  <th className="text-left p-4 font-medium">Bu Ay</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {localClients.map(client => {
                  const isEditing = editingId === client.id
                  const clientPayments = payments[client.id] ?? []
                  const thisMonthRec = clientPayments.find(p => p.month === cm)
                  const thisMonthStatus = computeStatus(client.payment_day, cm, thisMonthRec)
                  const statusCfg = STATUS_CONFIG[thisMonthStatus]
                  const isPaying = markingPaid === `${client.id}-${cm}`

                  return (
                    <tr key={client.id} className={`border-b border-border last:border-0 transition-colors ${thisMonthStatus === 'overdue' ? 'bg-red-500/5' : ''}`}>
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
                          <Input type="number" value={editValues.monthly_fee} onChange={e => setEditValues(v => ({ ...v, monthly_fee: e.target.value }))} placeholder="15000" className="h-8 w-28 text-sm" />
                        ) : (
                          <span className="font-semibold text-primary">{formatFee(client.monthly_fee)}</span>
                        )}
                      </td>

                      {/* Ödeme Günü */}
                      <td className="p-4">
                        {isEditing ? (
                          <Input type="number" min={1} max={28} value={editValues.payment_day} onChange={e => setEditValues(v => ({ ...v, payment_day: e.target.value }))} placeholder="15" className="h-8 w-20 text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{client.payment_day ? `Her ayın ${client.payment_day}'i` : '—'}</span>
                        )}
                      </td>

                      {/* Başlangıç */}
                      <td className="p-4">
                        {isEditing ? (
                          <Input type="date" value={editValues.client_start_date} onChange={e => setEditValues(v => ({ ...v, client_start_date: e.target.value }))} className="h-8 w-36 text-sm [color-scheme:dark]" />
                        ) : (
                          <span className="text-muted-foreground">{formatDate(client.client_start_date)}</span>
                        )}
                      </td>

                      {/* Bu Ay */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          {thisMonthStatus !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[10px] font-semibold border-green-500/30 text-green-500 hover:bg-green-500/10"
                              disabled={isPaying}
                              onClick={() => markPaid(client, cm)}
                            >
                              {isPaying ? '...' : 'Ödendi'}
                            </Button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:bg-green-500/10" onClick={() => saveEdit(client.id)} disabled={saving}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Düzenle" onClick={() => startEdit(client)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Ödeme geçmişi" onClick={() => setHistoryClient(client)}>
                              <History className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-500" title="Pasife al" onClick={() => setDeleteConfirmId(client.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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

      {/* Payment History Modal */}
      {historyClient && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setHistoryClient(null) }}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div>
                <h2 className="text-lg font-bold">{historyClient.gym_name}</h2>
                <p className="text-sm text-muted-foreground">Ödeme Geçmişi</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setHistoryClient(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="overflow-y-auto p-6 space-y-2">
              {monthsSince(historyClient.client_start_date).map(month => {
                const rec = (payments[historyClient.id] ?? []).find(p => p.month === month)
                const status = computeStatus(historyClient.payment_day, month, rec)
                const cfg = STATUS_CONFIG[status]
                const isPaying = markingPaid === `${historyClient.id}-${month}`
                return (
                  <div key={month} className={`flex items-center justify-between p-3 rounded-lg border ${status === 'overdue' ? 'border-red-500/20 bg-red-500/5' : status === 'paid' ? 'border-green-500/20 bg-green-500/5' : 'border-border bg-secondary/20'}`}>
                    <div>
                      <p className="font-medium text-sm">{monthLabel(month)}</p>
                      {rec?.paid_at && <p className="text-[10px] text-muted-foreground">{formatDate(rec.paid_at)} tarihinde ödendi</p>}
                      {rec?.amount && <p className="text-[10px] text-primary font-semibold">{formatFee(rec.amount)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                      {status !== 'paid' && (
                        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] font-semibold border-green-500/30 text-green-500 hover:bg-green-500/10" disabled={isPaying} onClick={() => markPaid(historyClient, month)}>
                          {isPaying ? '...' : 'Ödendi'}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto" />
            <div>
              <p className="font-bold text-lg">Müşteriyi Pasife Al</p>
              <p className="text-sm text-muted-foreground mt-1">Bu müşteri listeden kaldırılacak. Ödeme geçmişi korunur.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>İptal</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={deleting} onClick={() => deleteClient(deleteConfirmId)}>
                {deleting ? 'Siliniyor...' : 'Pasife Al'}
              </Button>
            </div>
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
                {adding ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
