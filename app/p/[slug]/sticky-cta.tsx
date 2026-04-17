"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

function toWaUrl(phone: string): string {
  const d = phone.replace(/\D/g, "")
  const num = d.startsWith("0") ? "9" + d : d.startsWith("90") ? d : "90" + d
  return `https://wa.me/${num}?text=${encodeURIComponent("Merhaba, üyelik hakkında bilgi almak istiyorum.")}`
}

export function StickyCTA({
  ctaText,
  primaryColor,
  salonId,
  slug,
  phone,
}: {
  ctaText: string
  primaryColor: string
  salonId: string
  slug: string
  phone?: string | null
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const form = document.getElementById("form-section")
    if (!form) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "0px 0px -100% 0px" }
    )
    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  const scrollToForm = () => {
    fetch("/api/page-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salon_id: salonId, event_type: "cta_click", slug }),
    }).catch(() => {})
    document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" })
  }

  if (!visible) return null

  const waUrl = phone ? toWaUrl(phone) : null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
      style={{ background: "linear-gradient(to top, rgba(10,10,10,0.95) 60%, transparent)" }}>
      <div className="max-w-md mx-auto flex gap-2">
        <button
          onClick={scrollToForm}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base text-black transition-opacity hover:opacity-90"
          style={{ background: primaryColor }}
        >
          <ArrowUp className="w-4 h-4" />
          {ctaText}
        </button>
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 py-3.5 rounded-xl border-2 transition-opacity hover:opacity-80 flex-shrink-0"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.533 5.845L.057 23.43a.5.5 0 0 0 .609.61l5.652-1.48A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.518-5.21-1.42l-.374-.222-3.876 1.015 1.034-3.772-.244-.389A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
