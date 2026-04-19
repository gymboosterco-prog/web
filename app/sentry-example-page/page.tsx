"use client"

import * as Sentry from "@sentry/nextjs"

export default function SentryTestPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>Sentry Test</h1>
      <button
        style={{ padding: "12px 24px", background: "#f2ff00", color: "#000", fontWeight: "bold", borderRadius: 8, cursor: "pointer", border: "none" }}
        onClick={() => {
          Sentry.captureException(new Error("Gymbooster Sentry test hatası — entegrasyon çalışıyor!"))
          alert("Hata Sentry'e gönderildi!")
        }}
      >
        Test Hatası Gönder
      </button>
    </div>
  )
}
