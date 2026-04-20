import { Dumbbell } from "lucide-react"
import Link from "next/link"
import { Comparison } from "@/components/comparison"

export function KarsilastirmaClient() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Gymbooster</span>
          </Link>
        </div>
      </div>
      <Comparison />
      <div className="container px-4 py-8 text-center">
        <Link href="/" className="text-sm text-primary hover:underline">← Ana Sayfaya Dön</Link>
      </div>
    </main>
  )
}
