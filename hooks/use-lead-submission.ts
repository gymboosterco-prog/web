import { useState } from "react"

export type LeadFormData = {
  name: string
  email: string
  phone: string
  gymName: string
}

export function useLeadSubmission() {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    gymName: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsSubmitted(true)
        
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
            em: formData.email.toLowerCase().trim(),
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
