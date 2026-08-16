import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { getR2PublicUrl } from '../../utils/r2Client'
import type { Service, ServiceCreateInput, ServiceUpdateInput } from '~/../shared/types/services'

export async function getAdminServicesList(): Promise<Service[]> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao listar serviços.' })
  }

  return (data || []).map((s: any) => ({
    ...(s as unknown as Service),
    card_image_url: s.card_image_storage_key ? getR2PublicUrl(s.card_image_storage_key) : null,
  }))
}

export async function getAdminServiceById(id: string): Promise<Service> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Serviço não encontrado.' })
  }

  return {
    ...(data as unknown as Service),
    card_image_url: data.card_image_storage_key ? getR2PublicUrl(data.card_image_storage_key) : null,
  }
}

export async function createAdminService(userId: string, input: ServiceCreateInput): Promise<Service> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('services')
    .insert({
      name: input.name,
      slug: input.slug,
      short_description: input.short_description,
      description: input.description,
      icon_key: input.icon_key,
      accent_variant: input.accent_variant || 'blue',
      is_active: false,
      is_featured: input.is_featured || false,
      display_order: input.display_order || 0,
      home_display_order: input.home_display_order || 0,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Já existe um serviço com este slug.' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Falha ao criar serviço.' })
  }

  return data as unknown as Service
}

export async function updateAdminService(userId: string, id: string, input: ServiceUpdateInput): Promise<Service> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('services')
    .update({
      ...input,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Já existe um serviço com este slug.' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Falha ao atualizar serviço.' })
  }

  return data as unknown as Service
}

export async function activateAdminService(userId: string, id: string): Promise<Service> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase.rpc('activate_service_atomic', {
    p_service_id: id,
    p_user_id: userId,
  })

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message || 'Falha ao ativar serviço.' })
  }

  return data as unknown as Service
}

export async function archiveAdminService(userId: string, id: string, archived: boolean): Promise<Service> {
  const supabase = getPrivateSupabaseClient()

  const { data, error } = await supabase
    .from('services')
    .update({
      archived_at: archived ? new Date().toISOString() : null,
      is_active: archived ? false : undefined,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao arquivar serviço.' })
  }

  return data as unknown as Service
}
