import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { GymboosterPixel } from '@/components/gymbooster-pixel'
import { PwaHandler } from '@/components/pwa-handler'
import { SentryInit } from '@/components/sentry-init'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

const BASE_URL = 'https://www.gymbooster.tr'

export const metadata: Metadata = {
  title: 'Gymbooster | Spor Salonları İçin AI Destekli Dijital Pazarlama',
  description: 'Spor salonunuza her ay garantili 30+ nitelikli potansiyel müşteri kazandırıyoruz. Yapay zeka destekli pazarlama stratejileri ile büyümenizi hızlandırın.',
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Gymbooster',
    title: 'Gymbooster | Spor Salonları İçin AI Destekli Dijital Pazarlama',
    description: 'Spor salonunuza her ay garantili 30+ nitelikli potansiyel müşteri kazandırıyoruz. Yapay zeka destekli pazarlama stratejileri ile büyümenizi hızlandırın.',
    locale: 'tr_TR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gymbooster — Spor Salonu Lead Yönetimi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gymbooster | Spor Salonları İçin AI Destekli Dijital Pazarlama',
    description: 'Spor salonunuza her ay garantili 30+ nitelikli potansiyel müşteri kazandırıyoruz.',
    images: ['/og-image.png'],
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GymCRM',
  },
}

export const viewport: Viewport = {
  themeColor: '#f2ff00',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Gymbooster',
      url: BASE_URL,
      logo: `${BASE_URL}/icon.svg`,
      description: 'Spor salonları için yapay zeka destekli dijital pazarlama ve lead yönetim sistemi.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        availableLanguage: 'Turkish',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Gymbooster',
      publisher: { '@id': `${BASE_URL}/#organization` },
      inLanguage: 'tr-TR',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Gymbooster nasıl çalışır?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yapay zeka destekli pazarlama araçlarıyla spor salonunuzu hedef kitlenize tanıtıyoruz ve her ay garantili 30+ nitelikli potansiyel müşteri kazandırıyoruz.',
          },
        },
        {
          '@type': 'Question',
          name: 'Kaç günde sonuç alırım?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Kampanyalar genellikle 3-5 iş günü içinde aktif hale gelir ve ilk lead\'ler ilk hafta içinde gelmeye başlar.',
          },
        },
        {
          '@type': 'Question',
          name: 'Minimum kaç ay çalışmam gerekiyor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aylık bazda çalışıyoruz, uzun vadeli sözleşme zorunluluğu yok.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PwaHandler />
          <SentryInit />
          <GymboosterPixel />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
