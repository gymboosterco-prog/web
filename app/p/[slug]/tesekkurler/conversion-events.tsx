"use client"

import { useEffect } from "react"

export function ConversionEvents({
  pixelId,
  googleAdsId,
  googleAdsLabel,
  phone,
  name,
}: {
  pixelId?: string | null
  googleAdsId?: string | null
  googleAdsLabel?: string | null
  phone?: string | null
  name?: string | null
}) {
  useEffect(() => {
    // Meta Pixel Lead event
    if (pixelId && typeof window !== "undefined" && (window as any).fbq) {
      ;(window as any).fbq("init", pixelId)
      ;(window as any).fbq("track", "Lead")
    }

    // Google Ads conversion (URL tabanlı yedek olarak da çalışır)
    if (googleAdsId && typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "conversion", {
        send_to: googleAdsLabel ? `${googleAdsId}/${googleAdsLabel}` : googleAdsId,
        value: 1.0,
        currency: "TRY",
      })
    }
  }, [])

  return null
}
