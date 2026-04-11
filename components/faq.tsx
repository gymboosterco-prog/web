"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "₺10.000/ay pahalı değil mi?",
    answer: "Hesaplayalım. Aylık üyelik ücretiniz ₺1.500 ise, sadece 7 yeni üye bu masrafı karşılar. Biz ayda 30 potansiyel müşteri garantisi veriyoruz. Siz bu 30 kişinin 7'sini üye yaparsanız kâra geçtiniz — geri kalan 23 potansiyel müşteri saf kâr. Bunu kârlı bulmuyorsanız konuşmayalım."
  },
  {
    question: "30 potansiyel müşteri garantisi veriyorsunuz ama satışı ben yapmak zorundayım.",
    answer: "Doğru. Biz boru hattını doldururuz, satışı siz yaparsınız. Bu yüzden ilk görüşmemizde satış sürecinizi de konuşuruz — arama şablonu, takip süreci. Gelen potansiyel müşteri'i doğru takip eden salonlar ortalama %15-25 dönüşüm görüyor."
  },
  {
    question: "Kendi başıma Meta reklamı verebilirim.",
    answer: "Kesinlikle verebilirsiniz. Bunu yapan çok salon var — sonra bize geliyor. Yanlış hedefleme, yüksek CPA, A/B test bilgisi yok, reklam hesabı askıya alındı. 2 yıldır sadece spor salonlarıyla çalışıyoruz. Bu deneyim fark yaratıyor."
  },
  {
    question: "İlk sonucu ne zaman görürüm?",
    answer: "Anlaştığımız günden 7 gün içinde kampanyalar aktif olur. İlk potansiyel müşteri'ler genellikle ilk hafta içinde gelmeye başlar. 30 günlük garantiyi saymak için beklemenize gerek yok — sonuçlar hızlı gelir."
  },
  {
    question: "3 aylık minimum sözleşme çok uzun.",
    answer: "İlk 30 günde sonuç yoksa tüm ödemenizi iade ediyoruz. Fiilen risk 30 gün. 3 ay şartı şundan: AI optimizasyon sistemimiz ilk 30 günde öğreniyor, ikinci ayda ivme kazanıyor, üçüncü ayda tam gücünde çalışıyor. Daha kısa sürede adil bir değerlendirme yapılamaz."
  },
  {
    question: "Şu an doğru zaman değil, biraz bekleyelim.",
    answer: "Her geçen ay boş kalan salonunuza kaç potansiyel üye gelmiyor? Aylık ₺1.500 üyelik × 6 kaçırılan üye = ₺9.000 kaybedilen gelir. Beklemenin maliyeti var. \"Doğru zaman\" genellikle şu andır."
  },
  {
    question: "Hangi tür salonlarla çalışıyorsunuz?",
    answer: "Butik pilates ve yoga stüdyolarından büyük fitness salonlarına, CrossFit box'larından PT stüdyolarına kadar her ölçekte çalışıyoruz. Ortak nokta: aktif olarak büyümek istemeleri."
  },
  {
    question: "Reklam bütçesi ayrı mı ödeniyor?",
    answer: "Evet. ₺10.000/ay hizmet bedeli — reklam yönetimi, strateji, CRM, raporlama. Reklam harcaması ayrıca Meta veya Google hesabınızdan doğrudan çıkar. Minimum ₺3.000/ay reklam bütçesi öneriyoruz."
  },
]

export function FAQ() {
  return (
    <section id="sss" className="py-12 md:py-20 lg:py-32 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">İtirazlar & Cevaplar</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 text-balance">
            Aklınızdaki <span className="text-primary">Soruları Bilelim</span>
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Dürüst sorular, dürüst cevaplar.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2 md:space-y-3 lg:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg md:rounded-xl px-4 md:px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-semibold hover:no-underline py-3 md:py-4 lg:py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4 lg:pb-5 potansiyel müşteriing-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
