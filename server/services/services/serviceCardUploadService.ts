import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { generatePresignedPutUrl, checkR2ObjectHead, getR2PublicUrl } from '../../utils/r2Client'
import { verifyR2ObjectMagicBytes } from '../../utils/magicBytesValidator'
import { getAdminServiceById } from './serviceAdminService'

export async function presignServiceCardImage(params: {
  userId: string
  serviceId: string
  fileExtension: string
  mimeType: string
  expectedSizeBytes: number
}) {
  const supabase = getPrivateSupabaseClient()
  await getAdminServiceById(params.serviceId)

  const storageKey = `services/cards/${crypto.randomUUID()}.${params.fileExtension}`
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { data: intent, error } = await supabase
    .from('upload_intents')
    .insert({
      user_id: params.userId,
      target_type: 'service_card_image',
      target_id: params.serviceId,
      storage_key: storageKey,
      expected_mime_type: params.mimeType,
      expected_size_bytes: params.expectedSizeBytes,
      max_size_bytes: 10485760, // 10MB
      expires_at: expiresAt,
    } as any)
    .select()
    .single()

  if (error || !intent) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao criar intenção de upload.' })
  }

  const presignedUrl = await generatePresignedPutUrl({
    storageKey,
    mimeType: params.mimeType,
    maxSizeBytes: 10485760,
  })

  return {
    intent_id: (intent as any).id,
    presigned_url: presignedUrl,
    expires_in_seconds: 300,
  }
}

export async function finalizeServiceCardImage(params: {
  userId: string
  intentId: string
  altText: string
}) {
  const supabase = getPrivateSupabaseClient()

  const { data: intentData, error: intentErr } = await supabase
    .from('upload_intents')
    .select('*')
    .eq('id', params.intentId)
    .eq('user_id', params.userId)
    .single()

  if (intentErr || !intentData) {
    throw createError({ statusCode: 404, statusMessage: 'Intenção de upload não encontrada.' })
  }

  const intent = intentData as any

  // Idempotência
  if (intent.status === 'completed') {
    const service = await getAdminServiceById(intent.target_id)
    return {
      success: true,
      service: {
        id: service.id,
        card_image_url: getR2PublicUrl(service.card_image_storage_key),
        card_image_alt: service.card_image_alt || '',
      },
    }
  }

  const head = await checkR2ObjectHead(intent.storage_key).catch(() => null)
  if (!head || !head.ContentLength) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo não encontrado no storage após upload.' })
  }

  const actualSizeBytes = head.ContentLength
  if (actualSizeBytes !== intent.expected_size_bytes || actualSizeBytes > intent.max_size_bytes) {
    throw createError({ statusCode: 400, statusMessage: 'Tamanho real do arquivo diverge do autorizado.' })
  }

  const isValidMagic = await verifyR2ObjectMagicBytes(intent.storage_key, intent.expected_mime_type)
  if (!isValidMagic) {
    throw createError({ statusCode: 400, statusMessage: 'Assinatura do arquivo inválida ou adulterada.' })
  }

  const { data: rpcData, error: rpcErr } = await supabase.rpc('finalize_service_card_image_atomic' as any, {
    p_intent_id: intent.id,
    p_user_id: params.userId,
    p_alt_text: params.altText,
    p_actual_size_bytes: actualSizeBytes,
  } as any)

  if (rpcErr || !rpcData || (rpcData as any).length === 0) {
    throw createError({ statusCode: 400, statusMessage: rpcErr?.message || 'Falha ao atualizar imagem do card.' })
  }

  const rpcList = rpcData as any
  const updatedService = rpcList[0].service_row
  const oldKey = rpcList[0].old_storage_key

  if (oldKey && oldKey !== intent.storage_key) {
    const inUse = await supabase.rpc('is_storage_key_in_use' as any, { p_key: oldKey } as any)
    if (!inUse.data) {
      await supabase.from('r2_orphan_cleanup_queue').insert({
        storage_key: oldKey,
        reason: 'service_card_replaced',
      } as any)
    }
  }

  return {
    success: true,
    service: {
      id: updatedService.id,
      card_image_url: getR2PublicUrl(updatedService.card_image_storage_key),
      card_image_alt: updatedService.card_image_alt,
    },
  }
}
