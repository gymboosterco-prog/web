import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
      ad_spend,
      next_action_at,
      next_action_type,
      last_contact_at,
      called_at,
      won_at,
      meeting_planned_at,
      rejection_reason
    } = body

    const supabase = await createClient()
    
    // Check for authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }


    const updateData: any = {
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
    if (ad_spend !== undefined) updateData.ad_spend = ad_spend
    if (next_action_at !== undefined) updateData.next_action_at = next_action_at
    if (next_action_type !== undefined) updateData.next_action_type = next_action_type
    if (last_contact_at !== undefined) updateData.last_contact_at = last_contact_at
    if (called_at !== undefined) updateData.called_at = called_at
    if (won_at !== undefined) updateData.won_at = won_at
    if (meeting_planned_at !== undefined) updateData.meeting_planned_at = meeting_planned_at
    if (rejection_reason !== undefined) updateData.rejection_reason = rejection_reason

    const { data, error } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Lead güncellenemedi" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check for authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }


    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Lead silinemedi" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
