"use client"

import { useEffect } from "react"

export function PageTracker({ salonId, slug }: { salonId: string; slug: string }) {
  useEffect(() => {
    fetch("/api/page-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salon_id: salonId, event_type: "page_view", slug }),
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
