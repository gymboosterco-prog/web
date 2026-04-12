"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dumbbell, Lock, Mail, AlertCircle } from "lucide-react"

export default function PortalLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteExpired = searchParams.get("error") === "invite_expired"
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError("Geçersiz e-posta veya şifre"); return }
      router.push("/portal")
      router.refresh()
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
          <h1 className="text-2xl font-bold">Salon Paneli</h1>
          <p className="text-muted-foreground mt-2">Başvuru yönetim sisteminize giriş yapın</p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border">
          <form onSubmit={handleLogin} className="space-y-4">
            {inviteExpired && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-500 text-sm border border-amber-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Davet linkinizin süresi dolmuş. Lütfen e-posta ve şifrenizle giriş yapın veya Gymbooster ile iletişime geçin.
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="email" placeholder="salon@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 pl-10 bg-secondary border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 pl-10 bg-secondary border-border" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">Gymbooster tarafından desteklenmektedir</p>
      </div>
    </div>
  )
}
