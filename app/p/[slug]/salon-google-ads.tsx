"use client"

import Script from "next/script"

export function SalonGoogleAds({
  adsId,
}: {
  adsId: string | null
}) {
  if (!adsId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
        strategy="afterInteractive"
      />
      <Script id={`salon-gtag-${adsId}`} strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${adsId}');
      `}</Script>
    </>
  )
}
