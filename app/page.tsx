import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { UrgencyBar } from "@/components/urgency-bar"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { StickyCTA } from "@/components/sticky-cta"

const Services = dynamic(() => import("@/components/services").then(m => ({ default: m.Services })))
const CaseStudies = dynamic(() => import("@/components/case-studies").then(m => ({ default: m.CaseStudies })))
const Guarantee = dynamic(() => import("@/components/guarantee").then(m => ({ default: m.Guarantee })))
const Process = dynamic(() => import("@/components/process").then(m => ({ default: m.Process })))
const FAQ = dynamic(() => import("@/components/faq").then(m => ({ default: m.FAQ })))
const Footer = dynamic(() => import("@/components/footer").then(m => ({ default: m.Footer })))

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <UrgencyBar />
      <div className="pt-10">
        <Header />
        <Hero />
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
        <Process />
        <section id="sss">
          <FAQ />
        </section>
        <Footer />
      </div>
      <StickyCTA />
    </main>
  )
}
