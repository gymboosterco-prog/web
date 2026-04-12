import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/p/'],
        disallow: ['/admin/', '/api/', '/portal/', '/f/'],
      },
    ],
    sitemap: 'https://www.gymbooster.tr/sitemap.xml',
  }
}
