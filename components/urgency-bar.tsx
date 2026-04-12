"use client"

import { useState, useEffect, useRef } from "react"
import { X, Zap } from "lucide-react"

// Fixed end date: 30 days from first build/deploy, stable across ticks
const END_MS = Date.now() + 30 * 24 * 60 * 60 * 1000

const getTimeLeft = () => {
  const diff = Math.max(0, END_MS - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes }
}

export function UrgencyBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--urgency-bar-height', isVisible ? '40px' : '0px')
    return () => {
      document.documentElement.style.setProperty('--urgency-bar-height', '0px')
    }
  }, [isVisible])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isMounted) return null
  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground py-1.5 md:py-2 px-2 md:px-4">
      <div className="container flex items-center justify-center gap-2 md:gap-4 text-[10px] sm:text-xs md:text-sm pr-6 md:pr-8">
        <Zap className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 hidden sm:block" />
        <span className="text-center leading-tight">
          <strong className="hidden sm:inline">ÖZEL TEKLİF:</strong>
          <strong className="sm:hidden">TEKLİF:</strong>
          {" "}İlk 5 salon <strong>%20 indirim!</strong>
          {" "}<strong className="tabular-nums">{timeLeft.days} gün {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')} kaldı</strong>
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
