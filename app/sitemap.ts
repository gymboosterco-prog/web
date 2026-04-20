import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.gymbooster.tr'
  const supabase = createAdminClient()
  const { data: salons } = await supabase
    .from('salons')
    .select('slug, updated_at')
    .eq('active', true)

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/fiyatlar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/karsilastirma`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/hesaplama`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/gizlilik`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...(salons ?? []).map(s => ({
      url: `${base}/p/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
