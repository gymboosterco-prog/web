"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Dumbbell } from "lucide-react"
import Link from "next/link"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-[var(--urgency-bar-height,40px)] left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-[top] duration-300">
      <div className="container px-4">
        <div className="flex items-center justify-between h-14 md:h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary flex items-center justify-center">
              <Dumbbell className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <span className="text-lg md:text-xl font-bold">Gymbooster</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <button 
              onClick={() => scrollToSection("hizmetler")}
              className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Hizmetler
            </button>
            <button 
              onClick={() => scrollToSection("sonuclar")}
              className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sonuçlar
            </button>
            <button 
              onClick={() => scrollToSection("garantiler")}
              className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Garantiler
            </button>
            <button
              onClick={() => scrollToSection("sss")}
              className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              SSS
            </button>
            <Link
              href="/fiyatlar"
              className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fiyatlar
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              onClick={() => scrollToSection("hero-form")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs lg:text-sm h-9 lg:h-10 px-3 lg:px-4"
            >
              Ücretsiz Görüşme
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-1.5 -mr-1.5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => scrollToSection("hizmetler")}
                className="text-left py-2.5 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Hizmetler
              </button>
              <button 
                onClick={() => scrollToSection("sonuclar")}
                className="text-left py-2.5 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Sonuçlar
              </button>
              <button 
                onClick={() => scrollToSection("garantiler")}
                className="text-left py-2.5 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Garantiler
              </button>
              <button
                onClick={() => scrollToSection("sss")}
                className="text-left py-2.5 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                SSS
              </button>
              <Link
                href="/fiyatlar"
                className="text-left py-2.5 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Fiyatlar
              </Link>
              <Button 
                onClick={() => scrollToSection("hero-form")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2 h-10"
              >
                Ücretsiz Görüşme
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
