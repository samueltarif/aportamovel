import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { generatePresignedPutUrl, checkR2ObjectHead, getR2PublicUrl, deleteR2Object } from '../../utils/r2Client'
import { verifyR2ObjectMagicBytes } from '../../utils/magicBytesValidator'
import type { ServiceMedia } from '~/../shared/types/publications'

export async function presignPublicationMedia(params: {
  userId: string
  publicationId: string
  fileExtension: string
  mimeType: string
  expectedSizeBytes: number
}) {
  const supabase = getPrivateSupabaseClient()
  const { data: pub, error: pubErr } = await supabase.from('service_publications').select('id').eq('id', params.publicationId).single()
  if (pubErr || !pub) throw createError({ statusCode: 404, statusMessage: 'Publicação não encontrada.' })

  const isVideo = params.mimeType.startsWith('video/')
  const maxSizeBytes = isVideo ? 104857600 : 10485760 // 100MB video, 10MB foto
  const storageKey = `publications/${params.publicationId}/${crypto.randomUUID()}.${params.fileExtension}`
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { data: intent, error } = await supabase.from('upload_intents').insert({
    user_id: params.userId,
    target_type: 'publication_media',
    target_id: params.publicationId,
    storage_key: storageKey,
    expected_mime_type: params.mimeType,
    expected_size_bytes: params.expectedSizeBytes,
    max_size_bytes: maxSizeBytes,
    expires_at: expiresAt,
  } as any).select().single()

  if (error || !intent) throw createError({ statusCode: 500, statusMessage: 'Falha ao criar intenção de upload de mídia.' })

  const presignedUrl = await generatePresignedPutUrl({ storageKey, mimeType: params.mimeType, maxSizeBytes })

  return { intent_id: (intent as any).id, presigned_url: presignedUrl, expires_in_seconds: 300 }
}

export async function finalizePublicationMedia(params: {
  userId: string
  intentId: string
  altText: string
  caption?: string
  mediaStage?: 'before' | 'after' | 'general'
  isCover?: boolean
  width?: number
  height?: number
  durationSeconds?: number
}): Promise<ServiceMedia> {
  const supabase = getPrivateSupabaseClient()
  const { data: intentData, error: intentErr } = await supabase.from('upload_intents').select('*').eq('id', params.intentId).eq('user_id', params.userId).single()
  if (intentErr || !intentData) throw createError({ statusCode: 404, statusMessage: 'Intenção de upload não encontrada.' })
  const intent = intentData as any

  if (intent.status === 'completed') {
    const { data: existingMedia } = await supabase.from('service_media').select('*').eq('storage_key', intent.storage_key).single()
    if (existingMedia) return { ...(existingMedia as any), url: getR2PublicUrl(existingMedia.storage_key) }
  }

  const head = await checkR2ObjectHead(intent.storage_key).catch(() => null)
  if (!head || !head.ContentLength) throw createError({ statusCode: 400, statusMessage: 'Arquivo não encontrado no storage após upload.' })

  const actualSizeBytes = head.ContentLength
  if (actualSizeBytes !== intent.expected_size_bytes || actualSizeBytes > intent.max_size_bytes) {
    throw createError({ statusCode: 400, statusMessage: 'Tamanho real do arquivo diverge do autorizado.' })
  }

  const isValidMagic = await verifyR2ObjectMagicBytes(intent.storage_key, intent.expected_mime_type)
  if (!isValidMagic) {
    await deleteR2Object(intent.storage_key).catch(() => null)
    throw createError({ statusCode: 400, statusMessage: 'Assinatura binária do arquivo inválida ou adulterada.' })
  }

  const { data: media, error: rpcErr } = await supabase.rpc('finalize_media_upload_atomic' as any, {
    p_intent_id: intent.id,
    p_user_id: params.userId,
    p_alt_text: params.altText,
    p_caption: params.caption || null,
    p_media_stage: params.mediaStage || 'general',
    p_is_cover: params.isCover || false,
    p_width: params.width || null,
    p_height: params.height || null,
    p_duration_seconds: params.durationSeconds || null,
    p_actual_size_bytes: actualSizeBytes,
  } as any)

  if (rpcErr || !media) {
    const inUse = await supabase.rpc('is_storage_key_in_use' as any, { p_key: intent.storage_key } as any)
    if (!inUse.data) {
      await supabase.from('r2_orphan_cleanup_queue').insert({ storage_key: intent.storage_key, reason: 'finalize_db_failure' } as any)
    }
    throw createError({ statusCode: 400, statusMessage: rpcErr?.message || 'Falha ao salvar mídia no banco.' })
  }

  return { ...(media as any), url: getR2PublicUrl((media as any).storage_key) } as unknown as ServiceMedia
}

export async function setMediaCover(userId: string, publicationId: string, mediaId: string) {
  const supabase = getPrivateSupabaseClient()
  const { error } = await supabase.rpc('set_media_cover_atomic' as any, { p_publication_id: publicationId, p_media_id: mediaId, p_user_id: userId } as any)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message || 'Falha ao definir capa.' })
  return { success: true }
}

export async function reorderMedia(userId: string, publicationId: string, mediaIds: string[]) {
  const supabase = getPrivateSupabaseClient()
  const { error } = await supabase.rpc('reorder_media_atomic' as any, { p_publication_id: publicationId, p_media_ids: mediaIds, p_user_id: userId } as any)
  if (error) throw createError({ statusCode: 400, statusMessage: error.message || 'Falha ao reordenar mídias.' })
  return { success: true }
}

export async function deleteMedia(userId: string, mediaId: string) {
  const supabase = getPrivateSupabaseClient()
  const { data: storageKey, error } = await supabase.rpc('delete_media_atomic' as any, { p_media_id: mediaId, p_user_id: userId } as any)
  if (error || !storageKey) throw createError({ statusCode: 400, statusMessage: error?.message || 'Falha ao remover mídia.' })

  try {
    await deleteR2Object(storageKey as string)
  } catch (r2Err) {
    console.error('[MediaAdmin] Falha ao deletar do R2, enfileirando:', r2Err)
    await supabase.from('r2_orphan_cleanup_queue').insert({ storage_key: storageKey as string, reason: 'delete_media_r2_failure' } as any)
  }

  return { success: true }
}
