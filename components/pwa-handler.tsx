"use client"

import { useEffect } from "react"

export function PwaHandler() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    
    if (window.location.pathname.startsWith('/admin')) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {})
          .catch((err) => console.error("Service Worker registration failed:", err))
      }

      if (document.readyState === "complete") {
        register()
      } else {
        window.addEventListener("load", register)
        return () => window.removeEventListener("load", register)
      }
    }
  }, [])

  return null
}
