"use client"

import { useEffect } from "react"

export function PwaHandler() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.pathname.startsWith('/admin')) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered:", reg))
          .catch((err) => console.error("Service Worker registration failed:", err))
      })
    }
  }, [])

  return null
}
