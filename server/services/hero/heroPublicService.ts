import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { getR2PublicUrl } from '../../utils/r2Client'
import type { PublicHeroSlide } from '~/../shared/types/heroSlides'

export async function getPublicHeroSlidesList(): Promise<PublicHeroSlide[]> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('hero_slides')
    .select(`
      id,
      sort_order,
      title_override,
      service_media!inner (
        id,
        storage_key,
        media_type,
        alt_text,
        service_publications!inner (
          id,
          status,
          services!inner (
            id,
            name,
            is_active,
            archived_at
          )
        )
      )
    `)
    .eq('is_active', true)
    .eq('service_media.media_type', 'image')
    .eq('service_media.service_publications.status', 'published')
    .eq('service_media.service_publications.services.is_active', true)
    .is('service_media.service_publications.services.archived_at', null)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[HeroPublic] Erro ao consultar slides do hero:', error)
    throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar carrossel do Hero.' })
  }

  return (data || []).map((row: any) => {
    const media = row.service_media
    const pub = media?.service_publications
    const srv = pub?.services

    const automaticTitle = srv?.name || ''
    const override = row.title_override?.trim()
    const effectiveTitle = override && override.length >= 2 ? override : automaticTitle

    return {
      id: row.id,
      imageUrl: getR2PublicUrl(media?.storage_key),
      altText: media?.alt_text || effectiveTitle || 'Foto do serviço A Portamóvel',
      title: effectiveTitle,
      sortOrder: row.sort_order,
    }
  })
}
