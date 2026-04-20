import type { Metadata } from "next"
import { FiyatlarClient } from "@/components/fiyatlar-client"

export const metadata: Metadata = {
  title: "Fiyatlandırma | Gymbooster — Spor Salonu Reklam Ajansı",
  description: "Gymbooster fiyatları: ₺10.000/ay, 50 garantili başvuru. Tutmazsak bedava çalışırız. Gizli ücret yok, uzun vadeli sözleşme yok.",
}

export default function FiyatlarPage() {
  return <FiyatlarClient />
}
