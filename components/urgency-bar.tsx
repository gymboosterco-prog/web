"use client"

import { useState, useEffect } from "react"
import { X, BadgeCheck } from "lucide-react"

export function UrgencyBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--urgency-bar-height', isVisible ? '40px' : '0px')
    return () => { document.documentElement.style.setProperty('--urgency-bar-height', '0px') }
  }, [isVisible])

  if (!isMounted || !isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground py-1.5 md:py-2 px-2 md:px-4">
      <div className="container flex items-center justify-center gap-2 md:gap-4 text-[10px] sm:text-xs md:text-sm pr-6 md:pr-8">
        <BadgeCheck className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 hidden sm:block" />
        <span className="text-center leading-tight">
          Ayda <strong>50 Potansiyel Müşteri Garantisi</strong>
          <span className="hidden sm:inline"> — Tutturmazsak tutturana kadar <strong>ücretsiz çalışırız</strong></span>
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 md:right-4 p-0.5 md:p-1 hover:bg-primary-foreground/10 rounded"
          aria-label="Kapat"
        >
          <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </div>
  )
}
