"use client"

import { useEffect } from "react"

export function SalonPixel({ pixelId }: { pixelId: string | null }) {
  useEffect(() => {
    if (!pixelId) return

    // Poll until the global fbq (loaded via layout.tsx) is available
    let attempts = 0
    const interval = setInterval(() => {
      if (typeof (window as any).fbq !== "undefined") {
        ;(window as any).fbq("init", pixelId)
        ;(window as any).fbq("track", "PageView")
        clearInterval(interval)
      }
      if (++attempts >= 40) clearInterval(interval) // give up after 10s
    }, 250)

    return () => clearInterval(interval)
  }, [pixelId])

  return null
}
