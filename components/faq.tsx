"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Gerçekten her ay 30+ lead garantisi veriyor musunuz?",
    answer: "Evet, kesinlikle. Her ay minimum 30 nitelikli potansiyel müşteri (telefon numarası ve bilgileri doğrulanmış, spor salonuyla ilgilenen kişiler) garantisi veriyoruz. Bu hedefe ulaşamazsak, tutturana kadar ücretsiz çalışmaya devam ediyoruz. Garanti sözleşmemizde yazılı."
  },
  {
    question: "Hangi tür spor salonları için uygunsunuz?",
    answer: "Butik pilates stüdyolarından büyük fitness zincirlerine kadar her ölçekte çalışıyoruz. CrossFit box'ları, yoga stüdyoları, geleneksel spor salonları, PT stüdyoları - hepsiyle deneyimimiz var."
  },
  {
    question: "Sonuç almak ne kadar sürer?",
    answer: "İlk lead'lerinizi genellikle 7 gün içinde görmeye başlarsınız. Üye dönüşümleri salonunuzun satış sürecine bağlı olarak 2-4 hafta içinde gelmeye başlar."
  },
  {
    question: "Bütçem sınırlı, yine de çalışabilir miyiz?",
    answer: "Aylık minimum 5.000 TL reklam bütçesi ile başlıyoruz. Bu, sağlıklı bir ROI için minimum eşik. Daha düşük bütçelerle sonuç almak zor olduğu için bu limitin altında çalışmıyoruz."
  },
  {
    question: "Sözleşme süresi ne kadar?",
    answer: "Minimum 3 aylık çalışıyoruz çünkü AI sistemlerimizin öğrenmesi ve optimize olması için bu süre gerekli. Ancak ilk 30 gün içinde memnun kalmazsanız tam para iade garantisi veriyoruz."
  },
  {
    question: "Rakiplerimden farkınız ne?",
    answer: "3 temel fark: 1) Sadece spor salonlarına odaklanıyoruz - niş uzmanlık. 2) AI destekli optimizasyon ile insan ajanslarından 2-3x daha iyi performans alıyoruz. 3) Performans garantisi veriyoruz, kimse bunu yapmıyor."
  },
  {
    question: "Raporlama nasıl yapılıyor?",
    answer: "Gerçek zamanlı dashboard erişimi + haftalık detaylı rapor + aylık strateji toplantısı. Her harcanan kuruşun nereye gittiğini görürsünüz."
  },
  {
    question: "Mevcut web sitem ve sosyal medyamla entegre çalışabilir misiniz?",
    answer: "Kesinlikle. Mevcut altyapınıza entegre oluyoruz. Gerekirse landing page, form, chatbot gibi unsurları da biz oluşturuyoruz - ek ücret yok."
  }
]

export function FAQ() {
  return (
    <section id="sss" className="py-12 md:py-20 lg:py-32 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 text-balance">
            Sıkça Sorulan <span className="text-primary">Sorular</span>
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Merak ettiklerinizi yanıtladık. Başka sorunuz varsa bize ulaşın.
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
                <AccordionContent className="text-xs md:text-sm text-muted-foreground pb-3 md:pb-4 lg:pb-5 leading-relaxed">
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
