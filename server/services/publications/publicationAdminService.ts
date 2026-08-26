import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { getR2PublicUrl, deleteR2Object } from '../../utils/r2Client'
import type { ServicePublication, AdminPublicationDetail } from '~/../shared/types/publications'

export async function getAdminPublicationsList(params?: {
  serviceId?: string
  status?: string
}): Promise<ServicePublication[]> {
  const supabase = getPrivateSupabaseClient()

  let query = supabase
    .from('service_publications')
    .select('*, services(name, slug)')
    .order('created_at', { ascending: false })

  if (params?.serviceId && params.serviceId !== 'all') {
    query = query.eq('service_id', params.serviceId)
  }
  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: 'Falha ao listar publicações.' })

  return (data || []).map((row: any) => ({
    ...(row as unknown as ServicePublication),
    service_name: row.services?.name || '',
    service_slug: row.services?.slug || '',
  }))
}

export async function getAdminPublicationById(id: string): Promise<AdminPublicationDetail> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('service_publications')
    .select('*, services(name, slug), service_media(*)')
    .eq('id', id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Publicação não encontrada.' })

  const medias = Array.isArray((data as any).service_media) ? (data as any).service_media : []
  medias.sort((a: any, b: any) => a.sort_order - b.sort_order)

  return {
    ...(data as unknown as AdminPublicationDetail),
    service_name: (data as any).services?.name || '',
    service_slug: (data as any).services?.slug || '',
    medias: medias.map((m: any) => ({
      ...m,
      url: getR2PublicUrl(m.storage_key),
      thumbnail_url: m.thumbnail_storage_key ? getR2PublicUrl(m.thumbnail_storage_key) : null,
    })),
  }
}

export async function createAdminPublication(
  userId: string,
  input: { service_id: string; title: string; slug: string; summary: string; description: string; display_order?: number }
): Promise<ServicePublication> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('service_publications')
    .insert({
      service_id: input.service_id,
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      description: input.description,
      display_order: input.display_order || 0,
      status: 'draft',
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'Já existe uma publicação com este slug.' })
    throw createError({ statusCode: 500, statusMessage: 'Falha ao criar publicação.' })
  }

  return data as unknown as ServicePublication
}

export async function updateAdminPublication(
  userId: string,
  id: string,
  input: { service_id?: string; title?: string; slug?: string; summary?: string; description?: string; display_order?: number }
): Promise<ServicePublication> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('service_publications')
    .update({
      ...input,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'Já existe uma publicação com este slug.' })
    throw createError({ statusCode: 500, statusMessage: 'Falha ao atualizar publicação.' })
  }

  return data as unknown as ServicePublication
}

export async function publishAdminPublication(userId: string, id: string): Promise<ServicePublication> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase.rpc('publish_publication_atomic', {
    p_publication_id: id,
    p_user_id: userId,
  })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message || 'Falha ao publicar trabalho.' })
  }

  return data as unknown as ServicePublication
}

export async function archiveAdminPublication(userId: string, id: string, archived: boolean): Promise<ServicePublication> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('service_publications')
    .update({
      status: archived ? 'archived' : 'draft',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: 'Falha ao arquivar publicação.' })

  return data as unknown as ServicePublication
}

export async function unpublishAdminPublication(userId: string, id: string): Promise<ServicePublication> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('service_publications')
    .update({
      status: 'draft',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: 'Falha ao ocultar publicação.' })

  return data as unknown as ServicePublication
}

export async function deleteAdminPublication(userId: string, id: string): Promise<{ success: boolean }> {
  const supabase = getPrivateSupabaseClient()

  // 1. Buscar todas as mídias para remover os arquivos do R2
  const { data: medias } = await supabase
    .from('service_media')
    .select('storage_key, thumbnail_storage_key')
    .eq('publication_id', id)

  // 2. Excluir a publicação (o banco faz cascade automático nas service_media)
  const { error } = await supabase
    .from('service_publications')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Falha ao excluir publicação.' })
  }

  // 3. Deletar objetos do storage Cloudflare R2
  if (medias && medias.length > 0) {
    for (const m of medias) {
      if (m.storage_key) {
        deleteR2Object(m.storage_key).catch((err) => console.error('[DeletePub] Erro ao deletar storage_key do R2:', err))
      }
      if (m.thumbnail_storage_key) {
        deleteR2Object(m.thumbnail_storage_key).catch((err) => console.error('[DeletePub] Erro ao deletar thumbnail do R2:', err))
      }
    }
  }

  return { success: true }
}
