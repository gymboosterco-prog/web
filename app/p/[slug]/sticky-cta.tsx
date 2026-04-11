"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function StickyCTA({ ctaText, primaryColor }: { ctaText: string; primaryColor: string }) {
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
    document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" })
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
      style={{ background: "linear-gradient(to top, rgba(10,10,10,0.95) 60%, transparent)" }}>
      <button
        onClick={scrollToForm}
        className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base text-black transition-opacity hover:opacity-90"
        style={{ background: primaryColor, display: "flex" }}
      >
        <ArrowUp className="w-4 h-4" />
        {ctaText}
      </button>
    </div>
  )
}
