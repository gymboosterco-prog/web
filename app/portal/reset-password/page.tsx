"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dumbbell, Lock, AlertCircle, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase hash fragment'tan session'ı otomatik alır
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // session hazır, form aktif
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError("Şifre en az 8 karakter olmalı"); return }
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return }
    setIsLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setError("Şifre güncellenemedi: " + error.message); return }
      setDone(true)
      setTimeout(() => router.push("/portal/login"), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Yeni Şifre Belirle</h1>
          <p className="text-muted-foreground mt-2">Salon paneliniz için yeni şifrenizi girin</p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border">
          {done ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
              <p className="font-semibold">Şifreniz güncellendi</p>
              <p className="text-sm text-muted-foreground">Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Yeni Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="En az 8 karakter"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="h-12 pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="h-12 pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isLoading ? "Güncelleniyor..." : "Şifremi Güncelle"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">Gymbooster tarafından desteklenmektedir</p>
      </div>
    </div>
  )
}
