import type { Metadata } from "next"
import { HesaplamaClient } from "@/components/hesaplama-client"

export const metadata: Metadata = {
  title: "ROI Hesaplayıcı | Gymbooster",
  description: "Gymbooster ile salonunuzun potansiyel aylık ek gelirini ve ROI'sini hesaplayın.",
}

export default function HesaplamaPage() {
  return <HesaplamaClient />
}
