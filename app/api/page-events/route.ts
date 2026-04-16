import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

const VALID_EVENTS = ["page_view", "cta_click", "form_submit"] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { salon_id, event_type, slug } = body

    if (!salon_id || !event_type || !slug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    if (!VALID_EVENTS.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin.from("page_events").insert({ salon_id, event_type, slug })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
