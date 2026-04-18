import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { UrgencyBar } from "@/components/urgency-bar"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { StickyCTA } from "@/components/sticky-cta"

const PainSection = dynamic(() => import("@/components/pain-section").then(m => ({ default: m.PainSection })))
const Services = dynamic(() => import("@/components/services").then(m => ({ default: m.Services })))
const CaseStudies = dynamic(() => import("@/components/case-studies").then(m => ({ default: m.CaseStudies })))
const Guarantee = dynamic(() => import("@/components/guarantee").then(m => ({ default: m.Guarantee })))
const ForWho = dynamic(() => import("@/components/for-who").then(m => ({ default: m.ForWho })))
const Process = dynamic(() => import("@/components/process").then(m => ({ default: m.Process })))
const FAQ = dynamic(() => import("@/components/faq").then(m => ({ default: m.FAQ })))
const HesaplamaClient = dynamic(() => import("@/components/hesaplama-client").then(m => ({ default: m.HesaplamaClient })))
const Footer = dynamic(() => import("@/components/footer").then(m => ({ default: m.Footer })))

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <UrgencyBar />
      <div className="pt-10">
        <Header />
        <Hero />
        <PainSection />
        <SocialProof />
        <section id="hizmetler">
          <Services />
        </section>
        <section id="sonuclar">
          <CaseStudies />
        </section>
        <section id="garantiler">
          <Guarantee />
        </section>
        <ForWho />
        <Process />
        <section id="sss">
          <FAQ />
        </section>
        <HesaplamaClient embedded />
        <Footer />
      </div>
      <StickyCTA />
    </main>
  )
}
