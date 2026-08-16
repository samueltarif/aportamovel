import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { getR2PublicUrl } from '../../utils/r2Client'
import type { PublicServiceItem } from '~/../shared/types/services'

export async function getPublicServicesList(options?: { onlyFeatured?: boolean }): Promise<PublicServiceItem[]> {
  const supabase = getPrivateSupabaseClient()

  let query = supabase
    .from('services')
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      card_image_storage_key,
      card_image_alt,
      icon_key,
      accent_variant,
      display_order,
      is_featured,
      home_display_order,
      service_publications(count)
    `)
    .eq('is_active', true)
    .is('archived_at', null)

  if (options?.onlyFeatured) {
    query = query.eq('is_featured', true).order('home_display_order', { ascending: true })
  } else {
    query = query.order('display_order', { ascending: true })
  }

  const { data, error } = await query

  if (error) {
    console.error('[ServicesPublic] Erro ao buscar serviços públicos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Falha ao buscar catálogo de serviços.',
    })
  }

  return (data || []).map((row: any) => {
    const pubCount = Array.isArray(row.service_publications) && row.service_publications[0]
      ? row.service_publications[0].count
      : 0

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      short_description: row.short_description,
      description: row.description,
      card_image_url: getR2PublicUrl(row.card_image_storage_key),
      card_image_alt: row.card_image_alt || row.name,
      icon_key: row.icon_key,
      accent_variant: row.accent_variant,
      display_order: row.display_order,
      is_featured: row.is_featured,
      home_display_order: row.home_display_order,
      publications_count: pubCount,
      has_publications: pubCount > 0,
    }
  })
}
