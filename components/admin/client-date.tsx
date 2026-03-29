"use client"

import { useEffect, useState } from "react"

const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

export function ClientDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null)

  useEffect(() => {
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const month = MONTHS_TR[date.getMonth()]
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      setFormattedDate(`${day} ${month} ${year} ${hours}:${minutes}`)
    } catch {
      setFormattedDate("-")
    }
  }, [dateString])

  // Return null during SSR to prevent hydration mismatch
  if (formattedDate === null) {
    return <span suppressHydrationWarning>-</span>
  }

  return <span suppressHydrationWarning>{formattedDate}</span>
}
