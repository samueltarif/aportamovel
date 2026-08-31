import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { getR2PublicUrl } from '../../utils/r2Client'
import type {
  AdminHeroSlideItem,
  AvailableHeroMedia,
  HeroSlideCreateInput,
  HeroSlideUpdateInput,
  PaginatedAvailableMediaResponse,
} from '~/../shared/types/heroSlides'

export async function getAdminHeroSlidesList(): Promise<AdminHeroSlideItem[]> {
  const supabase = getPrivateSupabaseClient()
  const { data, error } = await supabase
    .from('hero_slides')
    .select(`
      id, media_id, sort_order, is_active, title_override, created_at, updated_at,
      service_media (
        id, storage_key, thumbnail_storage_key, alt_text,
        service_publications (
          id, title, slug,
          services ( id, name, slug )
        )
      )
    `)
    .order('sort_order', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: 'Falha ao listar slides do Hero.' })

  return (data || []).map((row: any) => {
    const media = row.service_media
    const pub = media?.service_publications
    const srv = pub?.services
    const automaticTitle = srv?.name || ''
    const override = row.title_override?.trim()
    const effectiveTitle = override && override.length >= 2 ? override : automaticTitle

    return {
      id: row.id,
      media_id: row.media_id,
      sort_order: row.sort_order,
      is_active: row.is_active,
      title_override: row.title_override,
      service_name: automaticTitle,
      service_slug: srv?.slug || '',
      publication_title: pub?.title || '',
      publication_slug: pub?.slug || '',
      effective_title: effectiveTitle,
      image_url: getR2PublicUrl(media?.storage_key),
      thumbnail_url: media?.thumbnail_storage_key ? getR2PublicUrl(media.thumbnail_storage_key) : null,
      alt_text: media?.alt_text || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  })
}

export async function getAvailableHeroMediaList(params: {
  serviceId?: string
  search?: string
  page?: number
  limit?: number
}): Promise<PaginatedAvailableMediaResponse> {
  const supabase = getPrivateSupabaseClient()
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(50, Math.max(1, params.limit || 12))
  const offset = (page - 1) * limit

  const { data: existingSlides } = await supabase.from('hero_slides').select('media_id')
  const usedMediaIds = (existingSlides || []).map((s: any) => s.media_id)

  let query = supabase
    .from('service_media')
    .select(`
      id, publication_id, storage_key, thumbnail_storage_key, alt_text, is_cover,
      service_publications!inner (
        id, title, slug, status,
        services!inner ( id, name, slug, is_active, archived_at )
      )
    `, { count: 'exact' })
    .eq('media_type', 'image')
    .eq('service_publications.status', 'published')
    .eq('service_publications.services.is_active', true)
    .is('service_publications.services.archived_at', null)

  if (usedMediaIds.length > 0) query = query.not('id', 'in', `(${usedMediaIds.join(',')})`)
  if (params.serviceId && params.serviceId !== 'all') query = query.eq('service_publications.services.id', params.serviceId)
  if (params.search && params.search.trim()) {
    query = query.or(`title.ilike.%${params.search.trim()}%,alt_text.ilike.%${params.search.trim()}%`, {
      foreignTable: 'service_publications',
    })
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
  const { data, count, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar mídias disponíveis.' })

  const items: AvailableHeroMedia[] = (data || []).map((row: any) => {
    const pub = row.service_publications
    const srv = pub?.services
    return {
      id: row.id,
      publication_id: row.publication_id,
      publication_title: pub?.title || '',
      publication_slug: pub?.slug || '',
      service_id: srv?.id || '',
      service_name: srv?.name || '',
      service_slug: srv?.slug || '',
      storage_key: row.storage_key,
      image_url: getR2PublicUrl(row.storage_key),
      thumbnail_url: row.thumbnail_storage_key ? getR2PublicUrl(row.thumbnail_storage_key) : null,
      alt_text: row.alt_text || '',
      is_cover: row.is_cover,
      is_already_added: usedMediaIds.includes(row.id),
    }
  })

  return {
    items,
    pagination: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
  }
}

export async function createHeroSlide(userId: string, input: HeroSlideCreateInput): Promise<AdminHeroSlideItem> {
  const supabase = getPrivateSupabaseClient()
  const cleanOverride = input.title_override?.trim() || null

  const { data, error } = await supabase.rpc('create_hero_slide_atomic', {
    p_media_id: input.media_id,
    p_user_id: userId,
    p_title_override: cleanOverride,
  })

  if (error) {
    if (error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'Esta foto já está cadastrada no Hero.' })
    throw createError({ statusCode: 400, statusMessage: error.message || 'Falha ao adicionar slide ao Hero.' })
  }

  const list = await getAdminHeroSlidesList()
  return list.find((s) => s.id === data)!
}

export async function updateHeroSlide(userId: string, id: string, input: HeroSlideUpdateInput) {
  const supabase = getPrivateSupabaseClient()
  const payload: any = { updated_by: userId, updated_at: new Date().toISOString() }
  if (typeof input.is_active === 'boolean') payload.is_active = input.is_active
  if (input.title_override !== undefined) payload.title_override = input.title_override?.trim() || null

  const { error } = await supabase.from('hero_slides').update(payload).eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: 'Falha ao atualizar slide.' })
  return { success: true }
}

export async function deleteHeroSlide(userId: string, id: string) {
  const supabase = getPrivateSupabaseClient()
  const { error } = await supabase.rpc('delete_hero_slide_atomic', {
    p_slide_id: id,
    p_user_id: userId,
  })
  if (error) throw createError({ statusCode: 500, statusMessage: 'Falha ao remover slide do Hero.' })
  return { success: true }
}

export async function reorderHeroSlides(userId: string, slideIds: string[]) {
  const supabase = getPrivateSupabaseClient()
  const { error } = await supabase.rpc('reorder_hero_slides_atomic', { p_slide_ids: slideIds, p_user_id: userId })
  if (error) throw createError({ statusCode: 400, statusMessage: error.message || 'Falha ao reordenar slides.' })
  return { success: true }
}
