import type { Metadata } from "next"
import { KullanimKosullariClient } from "@/components/kullanim-kosullari-client"

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Gymbooster",
  description: "Gymbooster hizmet kullanım koşulları.",
}

export default function KullanimKosullariPage() {
  return <KullanimKosullariClient />
}
