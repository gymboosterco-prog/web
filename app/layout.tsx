import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { MetaPixelEvents } from '@/components/meta-pixel-events'
import { PwaHandler } from '@/components/pwa-handler'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

const BASE_URL = 'https://gymbooster.tr'

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
  themeColor: '#CCFF00',
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
          <MetaPixelEvents />
          <Analytics />
          <Script
            id="fb-pixel"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('set', 'autoConfig', false, '796159073358189');
                fbq('init', '796159073358189');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=796159073358189&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
        </ThemeProvider>
      </body>
    </html>
  )
}
