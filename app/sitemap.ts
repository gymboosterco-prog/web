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
    { url: `${base}/hesaplama`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...(salons ?? []).map(s => ({
      url: `${base}/p/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
