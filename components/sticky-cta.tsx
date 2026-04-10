"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (roughly 500px)
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToForm = () => {
    const heroForm = document.getElementById("hero-form")
    if (heroForm) {
      heroForm.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/95 backdrop-blur-sm border-t border-border lg:hidden">
      <Button 
        onClick={scrollToForm}
        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
      >
        <Phone className="w-5 h-5" />
        Ücretsiz Görüşme Talep Et
      </Button>
    </div>
  )
}
