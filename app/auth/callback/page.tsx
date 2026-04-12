"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dumbbell, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "set-password" | "error" | "done">("loading")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handle = async () => {
      // Supabase puts tokens in the hash fragment: #access_token=...&type=invite
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")
      const type = params.get("type")

      // PKCE flow: code in query params
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get("code")
      const next = searchParams.get("next") ?? "/portal"

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { setStatus("error"); return }
        router.replace(next)
        return
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error) { setStatus("error"); return }

        if (type === "invite" || type === "recovery") {
          // Kullanıcı şifre belirlememişse şifre formu göster
          setStatus("set-password")
        } else {
          router.replace("/portal")
        }
        return
      }

      setStatus("error")
    }

    handle()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return }
    if (password.length < 8) { setError("Şifre en az 8 karakter olmalı"); return }

    setIsSaving(true)
    setError("")
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setError(error.message); return }
      setStatus("done")
      setTimeout(() => router.replace("/portal"), 1500)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Salon Paneli</h1>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Giriş yapılıyor...</p>
          </div>
        )}

        {status === "set-password" && (
          <div className="p-8 rounded-2xl bg-card border border-border">
            <h2 className="text-lg font-bold mb-1">Şifrenizi Belirleyin</h2>
            <p className="text-sm text-muted-foreground mb-6">Hesabınıza erişmek için bir şifre oluşturun.</p>
            <form onSubmit={handleSetPassword} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Yeni Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="password" placeholder="En az 8 karakter" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={8}
                    className="h-12 pl-10 bg-secondary border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="password" placeholder="Şifrenizi tekrar girin" value={confirm}
                    onChange={e => setConfirm(e.target.value)} required
                    className="h-12 pl-10 bg-secondary border-border" />
                </div>
              </div>
              <Button type="submit" disabled={isSaving} className="w-full h-12 bg-primary text-primary-foreground font-semibold">
                {isSaving ? "Kaydediliyor..." : "Şifremi Kaydet ve Giriş Yap"}
              </Button>
            </form>
          </div>
        )}

        {status === "done" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <CheckCircle2 className="w-12 h-12 text-primary" />
            <p className="font-semibold">Şifreniz kaydedildi! Yönlendiriliyorsunuz...</p>
          </div>
        )}

        {status === "error" && (
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="font-semibold mb-1">Bağlantı geçersiz veya süresi dolmuş</p>
            <p className="text-sm text-muted-foreground mb-4">Gymbooster ile iletişime geçin, yeni davet linki isteyin.</p>
            <Button variant="outline" onClick={() => router.replace("/portal/login")}>
              Giriş sayfasına dön
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
