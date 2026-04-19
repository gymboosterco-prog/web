"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Wallet, Calendar, ArrowRight, CheckCircle2, AlertTriangle, Dumbbell, MessageCircle } from "lucide-react"
import Link from "next/link"

const GYMBOOSTER_WA = "905XXXXXXXXX" // ← kendi WhatsApp numaranızla değiştirin

const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n)

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n)

const GYMBOOSTER_LEADS = 50
const CONVERSION_RATE = 0.20
const NEW_MEMBERS_PER_MONTH = GYMBOOSTER_LEADS * CONVERSION_RATE // 10
const SERVICE_FEE = 10000

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  prefix = "",
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  suffix?: string
  prefix?: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
          <Input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
            }}
            className="w-24 h-8 text-right text-sm bg-secondary border-border"
          />
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{prefix}{fmt(min)}{suffix}</span>
        <span>{prefix}{fmt(max)}{suffix}</span>
      </div>
    </div>
  )
}

function ResultCard({
  label,
  value,
  sub,
  highlight = false,
  icon: Icon,
  warning = false,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  icon: React.ElementType
  warning?: boolean
}) {
  return (
    <motion.div
      layout
      className={`p-4 rounded-2xl border ${
        highlight
          ? "bg-primary/10 border-primary/30"
          : warning
          ? "bg-destructive/10 border-destructive/20"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${highlight ? "bg-primary/20" : warning ? "bg-destructive/20" : "bg-secondary"}`}>
          <Icon className={`w-4 h-4 ${highlight ? "text-primary" : warning ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className={`text-xl font-bold leading-tight ${highlight ? "text-primary" : warning ? "text-destructive" : "text-foreground"}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}

export function HesaplamaClient({ embedded = false }: { embedded?: boolean } = {}) {
  const [membershipFee, setMembershipFee] = useState(800)
  const [avgMonthsStay, setAvgMonthsStay] = useState(6)
  const [currentMonthlyNew, setCurrentMonthlyNew] = useState(5)

  const results = useMemo(() => {
    // Each new member generates: membershipFee × avgMonthsStay (lifetime value)
    // Per month, we get NEW_MEMBERS_PER_MONTH new members
    // Monthly recurring contribution of new members (amortized)
    const monthlyRevenuePerNewMember = membershipFee // they pay each month
    const monthlyExtraRevenue = NEW_MEMBERS_PER_MONTH * monthlyRevenuePerNewMember
    const lifetimeValuePerMember = membershipFee * avgMonthsStay
    const totalLifetimeFromGymbooster = NEW_MEMBERS_PER_MONTH * lifetimeValuePerMember
    const yearlyExtraRevenue = NEW_MEMBERS_PER_MONTH * membershipFee * Math.min(avgMonthsStay, 12)
    const monthlyNetGain = monthlyExtraRevenue - SERVICE_FEE
    const roi = ((monthlyExtraRevenue / SERVICE_FEE) * 100)
    const breakEvenMonths = monthlyNetGain >= 0 ? 1 : Math.ceil(SERVICE_FEE / monthlyExtraRevenue)
    const isPositive = monthlyNetGain >= 0

    return {
      monthlyExtraRevenue,
      yearlyExtraRevenue,
      monthlyNetGain,
      roi,
      breakEvenMonths,
      isPositive,
      lifetimeValuePerMember,
      totalLifetimeFromGymbooster,
    }
  }, [membershipFee, avgMonthsStay])

  const grid = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">

          {/* Inputs */}
          <div className="space-y-6 bg-card border border-border rounded-2xl p-6 md:p-8">
            <div>
              <h2 className="text-lg font-bold mb-1">Salon Bilgileriniz</h2>
              <p className="text-sm text-muted-foreground">Mevcut durumunuzu girin</p>
            </div>

            <SliderInput
              label="Aylık Üyelik Ücreti"
              value={membershipFee}
              onChange={setMembershipFee}
              min={100}
              max={15000}
              step={250}
              prefix="₺"
            />

            <SliderInput
              label="Ortalama Üye Kalış Süresi"
              value={avgMonthsStay}
              onChange={setAvgMonthsStay}
              min={1}
              max={24}
              suffix=" ay"
            />

            <SliderInput
              label="Mevcut Aylık Yeni Üye"
              value={currentMonthlyNew}
              onChange={setCurrentMonthlyNew}
              min={0}
              max={50}
              suffix=" üye"
            />

            {/* Gymbooster varsayımları */}
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Gymbooster Garantileri</p>
              {[
                `Aylık ${GYMBOOSTER_LEADS} nitelikli potansiyel müşteri`,
                `%${CONVERSION_RATE * 100} dönüşüm → ${NEW_MEMBERS_PER_MONTH} yeni üye/ay`,
                `Hizmet bedeli: ₺${fmt(SERVICE_FEE)}/ay`,
                "30 gün para iade garantisi",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Tahmini Sonuçlarınız</h2>
              <p className="text-sm text-muted-foreground">Gymbooster ile aylık projeksiyon</p>
            </div>

            <ResultCard
              icon={TrendingUp}
              label="Aylık Ek Gelir"
              value={fmtCurrency(results.monthlyExtraRevenue)}
              sub={`${NEW_MEMBERS_PER_MONTH} yeni üye × ₺${fmt(membershipFee)}/ay`}
              highlight
            />

            <ResultCard
              icon={Wallet}
              label="Aylık Net Kazanç"
              value={results.isPositive ? `+${fmtCurrency(results.monthlyNetGain)}` : fmtCurrency(results.monthlyNetGain)}
              sub={`Ek gelir − ₺${fmt(SERVICE_FEE)} hizmet bedeli`}
              highlight={results.isPositive}
              warning={!results.isPositive}
            />

            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                icon={TrendingUp}
                label="ROI"
                value={`%${fmt(results.roi)}`}
                sub="Aylık getiri"
                highlight={results.isPositive}
              />
              <ResultCard
                icon={Calendar}
                label="Yıllık Ek Gelir"
                value={fmtCurrency(results.yearlyExtraRevenue)}
                sub="12 aylık projeksiyon"
              />
            </div>

            <ResultCard
              icon={Users}
              label="Üye Başına Yaşam Boyu Değer"
              value={fmtCurrency(results.lifetimeValuePerMember)}
              sub={`₺${fmt(membershipFee)} × ${avgMonthsStay} ay`}
            />

            {/* Karşılaştırma */}
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-sm space-y-2">
              <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Mevcut vs Gymbooster</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mevcut aylık yeni üye geliri</span>
                <span className="font-semibold">{fmtCurrency(currentMonthlyNew * membershipFee)}</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>Gymbooster ile aylık ek gelir</span>
                <span className="font-bold">+{fmtCurrency(results.monthlyExtraRevenue)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between font-bold">
                <span>Toplam aylık gelir artışı</span>
                <span className="text-primary">
                  {fmtCurrency((currentMonthlyNew + NEW_MEMBERS_PER_MONTH) * membershipFee)}
                </span>
              </div>
            </div>

            {!results.isPositive && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Mevcut üyelik ücretinizle bu yatırım ilk etapta negatif görünüyor.
                  Üyelik ücretini artırarak veya bizimle görüşerek özel çözüm bulabiliriz.
                </span>
              </div>
            )}

            {/* CTA */}
            <div className="pt-2 space-y-3">
              <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base">
                <Link href="/#iletisim">
                  Ücretsiz Görüşme Talep Et
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-11 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 font-semibold text-sm">
                <a
                  href={`https://wa.me/${GYMBOOSTER_WA}?text=${encodeURIComponent("Merhaba, ROI hesaplayıcısını kullandım. Salonumun büyüme planı hakkında görüşmek istiyorum.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp&apos;tan Yaz
                </a>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Ücretsiz 45 dk strateji görüşmesi · Satış baskısı yok
              </p>
            </div>
          </div>
    </div>
  )

  if (embedded) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">ROI Hesaplayıcı</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Salonunuz İçin <span className="text-primary">Ne Kadar Kazanırsınız?</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Kendi rakamlarınızı girin, Gymbooster&apos;ın katkısını gerçek zamanlı görün.
            </p>
          </div>
          {grid}
        </div>
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="relative z-10 container px-4 py-12 md:py-20 max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">Gymbooster</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">ROI Hesaplayıcı</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Salonunuz İçin<br />
            <span className="text-primary">Ne Kadar Kazanırsınız?</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Kendi rakamlarınızı girin, Gymbooster&apos;ın salonunuza katkısını gerçek zamanlı hesaplayın.
          </p>
        </div>
        {grid}
      </div>
    </main>
  )
}
