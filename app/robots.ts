import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/portal/', '/f/'],
      },
    ],
    sitemap: 'https://gymbooster.tr/sitemap.xml',
  }
}
