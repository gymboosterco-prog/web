import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    if (searchParams.get("history") !== "1") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })

    const { data, error } = await supabase
      .from("lead_status_history")
      .select("*")
      .eq("lead_id", id)
      .order("changed_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Geçmiş getirilemedi" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      status,
      notes,
      meeting_date,
      value,
      assigned_to,
      instagram_url,
      member_count,
      lead_goal,
      call_count,
      call_log,
      ad_spend,
      next_action_at,
      next_action_type,
      last_contact_at,
      called_at,
      won_at,
      meeting_planned_at,
      rejection_reason,
      onboarding_steps,
    } = body

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    // Rol kontrolü: sadece ADMIN ve STAFF erişebilir
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile || !["ADMIN", "STAFF"].includes(profile.role ?? "")) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 })
    }

    // Validate status enum
    const VALID_STATUSES = ['new', 'called', 'meeting_planned', 'meeting_done', 'proposal', 'won', 'lost', 'cool_off']
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Geçersiz status değeri" }, { status: 400 })
    }

    // Validate next_action_type enum
    const VALID_ACTION_TYPES = ['CALL', 'MEETING', 'WHATSAPP', 'PROPOSAL_FOLLOWUP']
    if (next_action_type !== undefined && next_action_type !== null && !VALID_ACTION_TYPES.includes(next_action_type)) {
      return NextResponse.json({ error: "Geçersiz next_action_type değeri" }, { status: 400 })
    }

    // Validate numeric bounds
    if (value !== undefined && (typeof value !== 'number' || value < 0)) {
      return NextResponse.json({ error: "Geçersiz value değeri" }, { status: 400 })
    }
    if (member_count !== undefined && (typeof member_count !== 'number' || member_count < 0)) {
      return NextResponse.json({ error: "Geçersiz member_count değeri" }, { status: 400 })
    }
    if (lead_goal !== undefined && (typeof lead_goal !== 'number' || lead_goal < 0)) {
      return NextResponse.json({ error: "Geçersiz lead_goal değeri" }, { status: 400 })
    }
    if (call_count !== undefined && (typeof call_count !== 'number' || call_count < 0)) {
      return NextResponse.json({ error: "Geçersiz call_count değeri" }, { status: 400 })
    }
    if (ad_spend !== undefined && (typeof ad_spend !== 'number' || ad_spend < 0)) {
      return NextResponse.json({ error: "Geçersiz ad_spend değeri" }, { status: 400 })
    }

    // Validate ISO date strings
    const dateFields = { meeting_date, next_action_at, last_contact_at, called_at, won_at, meeting_planned_at }
    for (const [field, val] of Object.entries(dateFields)) {
      if (val !== undefined && val !== null && isNaN(Date.parse(val))) {
        return NextResponse.json({ error: `Geçersiz tarih: ${field}` }, { status: 400 })
      }
    }

    // Fetch current status for history tracking
    let existingStatus: string | null = null
    let existingAssignedTo: string | null = null
    if (status !== undefined) {
      const { data: existing } = await supabase
        .from("leads")
        .select("status, assigned_to")
        .eq("id", id)
        .single()
      existingStatus = existing?.status ?? null
      existingAssignedTo = existing?.assigned_to ?? null
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (meeting_date !== undefined) updateData.meeting_date = meeting_date
    if (value !== undefined) updateData.value = value
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (instagram_url !== undefined) updateData.instagram_url = instagram_url
    if (member_count !== undefined) updateData.member_count = member_count
    if (lead_goal !== undefined) updateData.lead_goal = lead_goal
    if (call_count !== undefined) updateData.call_count = call_count
    if (call_log !== undefined) {
      updateData.call_log = call_log
      // call_log güncelleniyorsa call_count otomatik senkronize et
      updateData.call_count = Array.isArray(call_log) ? call_log.length : 0
    }
    if (ad_spend !== undefined) updateData.ad_spend = ad_spend
    if (next_action_at !== undefined) updateData.next_action_at = next_action_at
    if (next_action_type !== undefined) updateData.next_action_type = next_action_type
    if (last_contact_at !== undefined) updateData.last_contact_at = last_contact_at
    if (called_at !== undefined) updateData.called_at = called_at
    if (won_at !== undefined) updateData.won_at = won_at
    if (meeting_planned_at !== undefined) updateData.meeting_planned_at = meeting_planned_at
    if (rejection_reason !== undefined) updateData.rejection_reason = rejection_reason
    if (onboarding_steps !== undefined) updateData.onboarding_steps = onboarding_steps

    const { data, error } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Lead güncellenemedi" }, { status: 500 })
    }

    // Write to history if status actually changed
    if (status !== undefined && existingStatus !== null && existingStatus !== status) {
      await supabase.from("lead_status_history").insert({
        lead_id: id,
        old_status: existingStatus,
        new_status: status,
        changed_by: user.email ?? existingAssignedTo ?? "Admin"
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    // Sadece ADMIN silebilir
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Sadece admin silebilir" }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from("leads")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Lead silinemedi" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 })
  }
}
