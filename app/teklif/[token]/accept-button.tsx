"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

export function AcceptButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")

  const accept = async () => {
    setState("loading")
    try {
      const res = await fetch(`/api/proposals/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      })
      if (res.ok) setState("done")
      else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "Bir hata oluştu, lütfen tekrar deneyin.")
        setState("idle")
      }
    } catch {
      alert("Bağlantı hatası oluştu, lütfen tekrar deneyin.")
      setState("idle")
    }
  }

  if (state === "done") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-xl font-bold mb-2">Teklifiniz Kabul Edildi!</p>
        <p className="text-white/60 text-sm">Ekibimiz en kısa sürede sizinle iletişime geçecek.</p>
      </div>
    )
  }

  return (
    <button
      onClick={accept}
      disabled={state === "loading"}
      className="w-full py-4 rounded-xl font-bold text-base text-black transition-opacity disabled:opacity-60"
      style={{ background: "#f2ff00" }}
    >
      {state === "loading" ? "İşleniyor..." : "✅ Teklifi Kabul Ediyorum"}
    </button>
  )
}
