import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { getR2PublicUrl } from '../../utils/r2Client'
import type { PaginatedPublicationsResponse, PublicPublicationDetail, PublicPublicationCard } from '~/../shared/types/publications'

export async function getPublicPublicationsList(params: {
  serviceSlug?: string
  page?: number
  limit?: number
}): Promise<PaginatedPublicationsResponse> {
  const supabase = getPrivateSupabaseClient()
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(50, Math.max(1, params.limit || 6))
  const offset = (page - 1) * limit
  const rangeTo = offset + limit - 1

  let dbQuery = supabase
    .from('service_publications')
    .select(`
      id,
      service_id,
      title,
      slug,
      summary,
      published_at,
      display_order,
      services!inner (
        id,
        name,
        slug,
        card_image_storage_key,
        is_active,
        archived_at
      ),
      service_media (
        id,
        storage_key,
        media_type,
        media_stage,
        thumbnail_storage_key,
        alt_text,
        is_cover,
        sort_order
      )
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('services.is_active', true)
    .is('services.archived_at', null)

  if (params.serviceSlug && params.serviceSlug !== 'all') {
    dbQuery = dbQuery.eq('services.slug', params.serviceSlug)
  }

  dbQuery = dbQuery
    .order('published_at', { ascending: false })
    .range(offset, rangeTo)

  const { data, count, error } = await dbQuery

  if (error) {
    console.error('[PublicationsPublic] Erro ao listar trabalhos:', error)
    throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar trabalhos realizados.' })
  }

  const items: PublicPublicationCard[] = (data || []).map((row: any) => {
    const srv = row.services
    const medias = Array.isArray(row.service_media) ? row.service_media : []
    const coverMedia = medias.find((m: any) => m.is_cover) || medias[0]

    // Fallback dinâmico de capa/poster
    const coverKey = coverMedia?.media_type === 'image'
      ? coverMedia.storage_key
      : (coverMedia?.thumbnail_storage_key || srv?.card_image_storage_key)

    const hasVideo = medias.some((m: any) => m.media_type === 'video')
    const hasBeforeAfter = medias.some((m: any) => m.media_stage === 'before' || m.media_stage === 'after')

    return {
      id: row.id,
      service_id: row.service_id,
      service_slug: srv?.slug || '',
      service_name: srv?.name || '',
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      published_at: row.published_at || '',
      cover_url: getR2PublicUrl(coverKey),
      cover_alt: coverMedia?.alt_text || row.title,
      media_count: medias.length,
      has_video: hasVideo,
      has_before_after: hasBeforeAfter,
    }
  })

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
    },
  }
}

export async function getPublicPublicationDetail(
  serviceSlug: string,
  publicationSlug: string
): Promise<PublicPublicationDetail> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('service_publications')
    .select(`
      id,
      service_id,
      title,
      slug,
      summary,
      description,
      published_at,
      services!inner (
        id,
        name,
        slug,
        card_image_storage_key,
        is_active,
        archived_at
      ),
      service_media (
        id,
        storage_key,
        media_type,
        media_stage,
        thumbnail_storage_key,
        alt_text,
        caption,
        sort_order,
        is_cover,
        width,
        height,
        duration_seconds
      )
    `)
    .eq('slug', publicationSlug)
    .eq('status', 'published')
    .eq('services.slug', serviceSlug)
    .eq('services.is_active', true)
    .is('services.archived_at', null)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Publicação não encontrada.' })
  }

  const srv = (data as any).services
  const mediasRaw = Array.isArray((data as any).service_media) ? (data as any).service_media : []
  mediasRaw.sort((a: any, b: any) => a.sort_order - b.sort_order)

  const medias = mediasRaw.map((m: any) => {
    const thumbKey = m.media_type === 'image'
      ? m.storage_key
      : (m.thumbnail_storage_key || srv?.card_image_storage_key)

    return {
      id: m.id,
      media_type: m.media_type,
      media_stage: m.media_stage,
      url: getR2PublicUrl(m.storage_key),
      thumbnail_url: getR2PublicUrl(thumbKey),
      alt_text: m.alt_text,
      caption: m.caption,
      sort_order: m.sort_order,
      is_cover: m.is_cover,
      width: m.width,
      height: m.height,
      duration_seconds: m.duration_seconds,
    }
  })

  return {
    id: data.id,
    service_id: data.service_id,
    service_slug: srv?.slug || '',
    service_name: srv?.name || '',
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    description: data.description,
    published_at: data.published_at || '',
    medias,
  }
}
