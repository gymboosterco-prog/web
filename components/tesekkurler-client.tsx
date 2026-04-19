"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Phone, Calendar, TrendingUp, ArrowLeft, Clock, Users, Star, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import confetti from "canvas-confetti"

const WA_URL = `https://wa.me/905452802612?text=${encodeURIComponent("Merhaba, az önce Gymbooster'dan görüşme talep ettim. Sizinle iletişime geçmek istedim.")}`

export function TesekkurlerClient() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // First burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#f2ff00", "#ffffff", "#a3ff47", "#e0ff99"],
    })

    // Second burst after 400ms
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#f2ff00", "#ffffff", "#a3ff47"],
      })
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#f2ff00", "#ffffff", "#a3ff47"],
      })
    }, 400)
  }, [])

  const steps = [
    {
      icon: Phone,
      step: "1",
      title: "24 Saat İçinde Aranacaksınız",
      desc: "Uzman ekibimiz sizi arayarak ihtiyaçlarınızı öğrenecek.",
    },
    {
      icon: Calendar,
      step: "2",
      title: "45 Dk Strateji Görüşmesi",
      desc: "Salonunuza özel büyüme fırsatlarını birlikte analiz edeceğiz.",
    },
    {
      icon: TrendingUp,
      step: "3",
      title: "Büyüme Planınız Hazır",
      desc: "Rakip analizi ve ROI projeksiyonuyla kişisel yol haritanızı alacaksınız.",
    },
  ]

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center">

        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="flex items-center justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
            <div className="relative w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-primary" />
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-semibold text-primary">Büyüme yolculuğunuz başladı</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Başvurunuz{" "}
            <span className="text-primary">Alındı!</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Harika bir karar verdiniz. Ekibimiz en kısa sürede sizinle iletişime geçecek ve salonunuzun büyüme potansiyelini birlikte keşfedeceğiz.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.1 }}
              className="relative p-5 rounded-2xl bg-card border border-border text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <span className="text-xs font-bold text-primary">{s.step}</span>
              </div>
              <s.icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-sm font-bold mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof + avg response */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span><strong className="text-foreground">87+</strong> salon büyümeye devam ediyor</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Ortalama yanıt: <strong className="text-foreground">24 saat</strong></span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold px-6">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5" />
              WhatsApp&apos;tan Yazın
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </motion.div>
      </div>
    </main>
  )
}
