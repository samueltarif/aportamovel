import { getPrivateSupabaseClient } from '../../utils/supabasePrivate'
import { deleteR2Object, checkR2ObjectHead } from '../../utils/r2Client'

export async function processR2CleanupQueue(limit = 20) {
  const supabase = getPrivateSupabaseClient()

  // 1. Processar itens pendentes na fila
  const { data: queueItems, error } = await supabase
    .from('r2_orphan_cleanup_queue')
    .select('*')
    .lt('attempts', 5)
    .lte('next_attempt_at', new Date().toISOString())
    .order('next_attempt_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[R2Cleanup] Erro ao buscar fila:', error)
    return { processed: 0, errors: 1 }
  }

  let processedCount = 0
  let errorCount = 0

  for (const item of queueItems || []) {
    try {
      // Proteção de segurança: verificar se a chave está em uso ativo antes de apagar
      const { data: inUse } = await supabase.rpc('is_storage_key_in_use', { p_key: item.storage_key })
      if (inUse) {
        // Se estiver em uso, remover da fila sem tocar no R2
        await supabase.from('r2_orphan_cleanup_queue').delete().eq('id', item.id)
        processedCount++
        continue
      }

      await deleteR2Object(item.storage_key)

      // Sucesso na exclusão: remover da fila
      await supabase.from('r2_orphan_cleanup_queue').delete().eq('id', item.id)
      processedCount++
    } catch (err: any) {
      // Se retornou 404 (NoSuchKey), o arquivo já não existe, considerar concluído
      if (err?.$metadata?.httpStatusCode === 404 || err?.name === 'NotFound' || err?.name === 'NoSuchKey') {
        await supabase.from('r2_orphan_cleanup_queue').delete().eq('id', item.id)
        processedCount++
        continue
      }

      console.error(`[R2Cleanup] Erro ao deletar ${item.storage_key}:`, err)
      const nextAttempts = item.attempts + 1
      const backoffMinutes = nextAttempts * 15 // Backoff linear
      const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()

      await supabase
        .from('r2_orphan_cleanup_queue')
        .update({
          attempts: nextAttempts,
          last_error: err?.message || 'Erro desconhecido',
          next_attempt_at: nextAttemptAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      errorCount++
    }
  }

  // 2. Limpar intenções de upload pendentes expiradas (> 24h)
  const expiredThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: expiredIntents } = await supabase
    .from('upload_intents')
    .select('*')
    .eq('status', 'pending')
    .lt('expires_at', expiredThreshold)
    .limit(limit)

  for (const intent of expiredIntents || []) {
    // Checar se o arquivo foi enviado ao R2
    const head = await checkR2ObjectHead(intent.storage_key).catch(() => null)
    if (head) {
      const { data: inUse } = await supabase.rpc('is_storage_key_in_use', { p_key: intent.storage_key })
      if (!inUse) {
        await supabase.from('r2_orphan_cleanup_queue').insert({
          storage_key: intent.storage_key,
          reason: 'expired_intent_cleanup',
        })
      }
    }

    await supabase
      .from('upload_intents')
      .update({ status: 'expired' })
      .eq('id', intent.id)
  }

  return { processed: processedCount, errors: errorCount }
}

export const processR2OrphanQueue = processR2CleanupQueue
