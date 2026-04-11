import { Dumbbell, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-8 md:py-12 bg-card border-t border-border">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary flex items-center justify-center">
                <Dumbbell className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="text-lg md:text-xl font-bold">Gymbooster</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 max-w-md">
              Spor salonları için AI destekli dijital pazarlama ajansı. 
              Üye sayınızı katlıyoruz, garantili.
            </p>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">info@gymbooster.tr</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span>+90 (212) 123 45 67</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span>Levent, İstanbul</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Hızlı Linkler</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li>
                <a href="#hizmetler" className="hover:text-foreground transition-colors">Hizmetler</a>
              </li>
              <li>
                <a href="#sonuclar" className="hover:text-foreground transition-colors">Sonuçlar</a>
              </li>
              <li>
                <a href="#garantiler" className="hover:text-foreground transition-colors">Garantiler</a>
              </li>
              <li>
                <a href="#sss" className="hover:text-foreground transition-colors">SSS</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Yasal</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Gizlilik Politikası</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">Kullanım Koşulları</a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">KVKK</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-[10px] md:text-sm text-muted-foreground text-center md:text-left">
            © 2026 Gymbooster. Tüm hakları saklıdır.
          </p>
          <p className="text-[10px] md:text-sm text-muted-foreground text-center md:text-right">
            {"Türkiye'nin #1 Spor Salonu Dijital Pazarlama Ajansı"}
          </p>
        </div>
      </div>
    </footer>
  )
}
