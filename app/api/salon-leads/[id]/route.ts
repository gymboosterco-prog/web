import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function getAuthorizedClient(leadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Yetkisiz erişim", status: 401, supabase: null, profile: null }

  const { data: profile } = await supabase.from("profiles").select("role, salon_id").eq("id", user.id).maybeSingle()
  if (!profile) return { error: "Profil bulunamadı", status: 403, supabase: null, profile: null }

  return { supabase, profile, error: null, status: 200 }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, profile, error, status } = await getAuthorizedClient(id)
  if (error || !supabase || !profile) return NextResponse.json({ error }, { status })

  const body = await request.json()
  const allowed = ["status", "notes", "called_at", "call_count", "meeting_date", "next_action_at"]
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { error: updateError } = await supabase.from("salon_leads").update(updates).eq("id", id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, profile, error, status } = await getAuthorizedClient(id)
  if (error || !supabase || !profile) return NextResponse.json({ error }, { status })

  if (profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Sadece admin silebilir" }, { status: 403 })
  }

  const { error: deleteError } = await supabase.from("salon_leads").delete().eq("id", id)
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
