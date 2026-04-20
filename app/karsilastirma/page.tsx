import type { Metadata } from "next"
import { KarsilastirmaClient } from "@/components/karsilastirma-client"

export const metadata: Metadata = {
  title: "Gymbooster vs Genel Reklam Ajansı | Neden Gymbooster?",
  description: "Gymbooster ile genel reklam ajansını karşılaştırın. Spor salonunuz için hangisi daha iyi sonuç verir? 50 başvuru garantisi, 7 günde kampanya, 87+ salon deneyimi.",
}

export default function KarsilastirmaPage() {
  return <KarsilastirmaClient />
}
