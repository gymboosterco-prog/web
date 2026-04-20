import type { Metadata } from "next"
import { GizlilikClient } from "@/components/gizlilik-client"

export const metadata: Metadata = {
  title: "Gizlilik Politikası & KVKK | Gymbooster",
  description: "Gymbooster kişisel veri işleme politikası ve KVKK aydınlatma metni.",
}

export default function GizlilikPage() {
  return <GizlilikClient />
}
