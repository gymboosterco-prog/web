import { Header } from "@/components/header"
import { UrgencyBar } from "@/components/urgency-bar"
import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"
import { Services } from "@/components/services"
import { CaseStudies } from "@/components/case-studies"
import { Guarantee } from "@/components/guarantee"
import { Process } from "@/components/process"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"
import { StickyCTA } from "@/components/sticky-cta"

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
