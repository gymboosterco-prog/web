"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STORAGE_KEY = "gymbooster_cookie_consent"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted")
    setVisible(false)
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-card border-t border-border shadow-2xl">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Bu site daha iyi bir deneyim sunmak için çerez kullanır.{" "}
          <Link href="/gizlilik" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Gizlilik Politikası
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={reject} className="text-xs h-8">
            Reddet
          </Button>
          <Button size="sm" onClick={accept} className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90">
            Kabul Et
          </Button>
        </div>
      </div>
    </div>
  )
}
