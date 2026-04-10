import { useState } from "react"
import { useRouter } from "next/navigation"

export type LeadFormData = {
  name: string
  phone: string
  gymName: string
  instagramUrl?: string
}

export function useLeadSubmission() {
  const router = useRouter()
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    phone: "",
    gymName: "",
    instagramUrl: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Client-side validasyon
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Ad en az 2 karakter olmalıdır")
      setIsSubmitting(false)
      return
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      setError("Geçerli bir telefon numarası girin")
      setIsSubmitting(false)
      return
    }
    if (!formData.gymName.trim() || formData.gymName.trim().length < 2) {
      setError("Salon adı en az 2 karakter olmalıdır")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsSubmitted(true)
        router.push('/tesekkurler')

        // Meta Pixel Lead tracking with Advanced Matching
        if (typeof window !== 'undefined' && (window as any).fbq) {
          const nameParts = formData.name.trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

          (window as any).fbq('track', 'Lead', {
            content_name: 'Gymbooster Lead Form',
            content_category: 'Consultation Request',
            value: 0.00,
            currency: 'TRY',
            // Advanced Matching Parameters
            ph: formData.phone.replace(/\D/g, ''),
            fn: firstName.toLowerCase().trim(),
            ln: lastName.toLowerCase().trim()
          });
        }
      } else {
        const data = await response.json()
        setError(data.error || "Bir hata oluştu. Lütfen tekrar deneyin.")
      }
    } catch (err) {
      console.error("Form submission error:", err)
      setError("Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return {
    formData,
    isSubmitting,
    isSubmitted,
    error,
    handleSubmit,
    updateField
  }
}
