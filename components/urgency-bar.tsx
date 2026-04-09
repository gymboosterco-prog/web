"use client"

import { useState, useEffect } from "react"
import { X, Zap } from "lucide-react"

export function UrgencyBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Set CSS variable for height; clean up on unmount
    document.documentElement.style.setProperty('--urgency-bar-height', isVisible ? '40px' : '0px')
    return () => {
      document.documentElement.style.setProperty('--urgency-bar-height', '0px')
    }
  }, [isVisible])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
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
          <strong className="hidden sm:inline">MART AYI ÖZEL:</strong>
          <strong className="sm:hidden">MART:</strong>
          {" "}İlk 5 salon <strong>%20 indirim!</strong>
          <span className="hidden sm:inline">{" "}Kalan süre:</span>
          {" "}<strong className="tabular-nums">{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</strong>
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
