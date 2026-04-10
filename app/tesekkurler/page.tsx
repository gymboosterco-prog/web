import type { Metadata } from "next"
import { TesekkurlerClient } from "@/components/tesekkurler-client"

export const metadata: Metadata = {
  title: "Teşekkürler | Gymbooster",
  description: "Başvurunuz alındı. Ekibimiz 24 saat içinde sizinle iletişime geçecek.",
  robots: { index: false, follow: false },
}

export default function TesekkurlerPage() {
  return <TesekkurlerClient />
}
