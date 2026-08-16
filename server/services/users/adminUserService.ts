import crypto from 'node:crypto'
import { createError } from 'h3'
import { getSupabaseAdminClient } from '../../utils/supabasePrivate'
import type { AdminUsersListResponse, AdminUserAuditItem } from '~~/shared/types/adminUsers'

export function computeRequestHash(payload: unknown): string {
  let secret = 'dev_secret_hmac_must_be_at_least_32_bytes_long_1234567890'
  try {
    const config = useRuntimeConfig()
    if (config.idempotencyHmacSecret) secret = config.idempotencyHmacSecret
  } catch {}
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload ?? {})).digest('hex')
}

export function isUserNotFoundError(err: any): boolean {
  if (!err) return false
  const msg = (err.message || '').toLowerCase()
  return err.status === 404 || err.code === '404' || msg.includes('not found')
}

export async function executeLazyRecovery(db: any, email: string): Promise<boolean> {
  const { data: rec } = await db.rpc('claim_stale_admin_invite_compensation_recovery', { p_normalized_email: email })
  if (!rec || !rec.success) return false
  if (rec.reconciled_status === 'completed') return true
  const { compensation_token, auth_user_id } = rec
  if (!auth_user_id || !compensation_token) return false

  const { data: userData, error: getErr } = await db.auth.admin.getUserById(auth_user_id)
  if (!getErr && userData?.user) {
    const { error: delErr } = await db.auth.admin.deleteUser(auth_user_id)
    if (!delErr) {
      await db.rpc('finalize_admin_invite_compensation', { p_normalized_email: email, p_compensation_token: compensation_token, p_auth_user_id: auth_user_id })
      return true
    }
    return false
  } else if (isUserNotFoundError(getErr)) {
    await db.rpc('finalize_admin_invite_compensation', { p_normalized_email: email, p_compensation_token: compensation_token, p_auth_user_id: auth_user_id })
    return true
  }
  return false
}

export async function inviteAdminUser(actorId: string, email: string, role: string, key: string) {
  const db = getSupabaseAdminClient()
  const config = useRuntimeConfig()
  const confirmUrl = config.adminAuthConfirmUrl || 'http://localhost:3000/auth/confirm'
  const normEmail = email.trim().toLowerCase()
  const hash = computeRequestHash({ email: normEmail, role })

  const { data: idem, error: idemErr } = await db.rpc('acquire_idempotency_key', {
    p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_request_hash: hash,
    p_processing_ttl_secs: 300, p_result_ttl_secs: 86400,
  })
  if (idemErr || !idem) throw createError({ statusCode: 409, message: 'Operação em processamento ou conflito de idempotência.' })
  const idemData = idem as any
  if (idemData.state === 'completed') return idemData.response

  const execToken = idemData.execution_token
  const { data: rateOk } = await db.rpc('check_and_increment_rate_limit', { p_key: `admin_invite:${actorId}`, p_max_attempts: 5, p_window_secs: 3600 })
  if (!rateOk) {
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Rate limit' } })
    throw createError({ statusCode: 429, message: 'Limite de convites excedido. Aguarde 1 hora.' })
  }

  let resData: any
  try {
    const { data: res, error: resErr } = await db.rpc('acquire_admin_invite_reservation', {
      p_normalized_email: normEmail, p_actor_user_id: actorId, p_idempotency_key: key, p_processing_ttl_secs: 300, p_result_ttl_secs: 86400,
    })
    if (resErr || !res) {
      const recovered = await executeLazyRecovery(db, normEmail)
      if (recovered) {
        const { data: retryRes } = await db.rpc('acquire_admin_invite_reservation', {
          p_normalized_email: normEmail, p_actor_user_id: actorId, p_idempotency_key: key, p_processing_ttl_secs: 300, p_result_ttl_secs: 86400,
        })
        resData = retryRes
      }
      if (!resData) {
        await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Reconciliação' } })
        throw createError({ statusCode: 409, message: 'Convite em processamento ou reconciliação. Aguarde instantes.' })
      }
    } else {
      resData = res
    }
  } catch (err: any) {
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: err.message } })
    throw err
  }

  if (resData.state === 'completed_by_same_operation') return { success: true, message: 'Convite concluído com sucesso.' }
  const leaseToken = resData.lease_token
  const { data: existing } = await db.rpc('get_admin_user_by_email_atomic', { p_normalized_email: normEmail })
  const existData = existing as any

  if (existData?.has_admin_record) {
    await db.rpc('release_admin_invite_reservation', { p_normalized_email: normEmail, p_lease_token: leaseToken, p_actor_user_id: actorId, p_idempotency_key: key, p_status: 'failed' })
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Admin existente' } })
    throw createError({ statusCode: 409, message: 'Este e-mail já possui cadastro administrativo no sistema.' })
  }

  if (existData?.auth_user_id) {
    const bound = await db.rpc('bind_admin_invite_auth_user', { p_normalized_email: normEmail, p_lease_token: leaseToken, p_actor_user_id: actorId, p_idempotency_key: key, p_auth_user_id: existData.auth_user_id })
    if (!bound.data) throw createError({ statusCode: 409, message: 'Tempo de processamento excedido. Tente novamente.' })

    await db.rpc('commit_pending_admin_invite_atomic', { p_normalized_email: normEmail, p_lease_token: leaseToken, p_actor_user_id: actorId, p_idempotency_key: key, p_auth_user_id: existData.auth_user_id, p_role: role })
    const { error: otpErr } = await db.auth.signInWithOtp({ email: normEmail, options: { shouldCreateUser: false, emailRedirectTo: confirmUrl } })
    const resp = { success: true, delivery_status: otpErr ? 'failed' : 'delivered', resend_available: !!otpErr, message: otpErr ? 'Acesso concedido. Instabilidade no e-mail. Reenvio disponível.' : 'Acesso concedido e e-mail enviado com sucesso.' }
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'completed', p_response: resp })
    return resp
  }

  const { data: invData, error: invErr } = await db.auth.admin.inviteUserByEmail(normEmail, { redirectTo: confirmUrl })
  if (invErr || !invData?.user?.id) {
    await db.rpc('release_admin_invite_reservation', { p_normalized_email: normEmail, p_lease_token: leaseToken, p_actor_user_id: actorId, p_idempotency_key: key, p_status: 'failed' })
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Falha envio' } })
    throw createError({ statusCode: 502, message: 'Falha ao disparar o convite por e-mail.' })
  }

  const newAuthId = invData.user.id
  const bound = await db.rpc('bind_admin_invite_auth_user', { p_normalized_email: normEmail, p_lease_token: leaseToken, p_actor_user_id: actorId, p_idempotency_key: key, p_auth_user_id: newAuthId })
  if (!bound.data) {
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Lease expirou' } })
    throw createError({ statusCode: 500, message: 'Tempo limite excedido. Reenvie o convite para concluir o vínculo.' })
  }

  try {
    await db.rpc('commit_pending_admin_invite_atomic', { p_normalized_email: normEmail, p_lease_token: leaseToken, p_actor_user_id: actorId, p_idempotency_key: key, p_auth_user_id: newAuthId, p_role: role })
    const resp = { success: true, message: 'Convite enviado com sucesso.' }
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'completed', p_response: resp })
    return resp
  } catch {
    const { data: clData } = await db.rpc('claim_admin_invite_compensation', { p_normalized_email: normEmail, p_lease_token: leaseToken, p_actor_user_id: actorId, p_idempotency_key: key, p_auth_user_id: newAuthId })
    const claimRes = clData as any
    if (claimRes?.success && claimRes.compensation_token) {
      await db.auth.admin.deleteUser(newAuthId)
      await db.rpc('finalize_admin_invite_compensation', { p_normalized_email: normEmail, p_compensation_token: claimRes.compensation_token, p_auth_user_id: newAuthId })
    }
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'invite_admin', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Falha commit' } })
    throw createError({ statusCode: 500, message: 'Erro interno ao registrar convite.' })
  }
}

export async function resendAdminInvite(actorId: string, targetUserId: string, key: string) {
  const db = getSupabaseAdminClient()
  const config = useRuntimeConfig()
  const confirmUrl = config.adminAuthConfirmUrl || 'http://localhost:3000/auth/confirm'
  const hash = computeRequestHash({ targetUserId })

  const { data: idem, error: idemErr } = await db.rpc('acquire_idempotency_key', { p_actor_user_id: actorId, p_operation: 'resend_invite', p_key: key, p_request_hash: hash, p_processing_ttl_secs: 60, p_result_ttl_secs: 86400 })
  if (idemErr || !idem) throw createError({ statusCode: 409, message: 'Reenvio em processamento ou conflito de chave.' })
  const idemData = idem as any
  if (idemData.state === 'completed') return idemData.response
  const execToken = idemData.execution_token

  const { data: rateOk } = await db.rpc('check_and_increment_rate_limit', { p_key: `admin_resend:${targetUserId}`, p_max_attempts: 3, p_window_secs: 3600 })
  if (!rateOk) {
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'resend_invite', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Rate limit' } })
    throw createError({ statusCode: 429, message: 'Limite de reenvios excedido para este usuário. Aguarde 1 hora.' })
  }

  const { data: lease, error: leaseErr } = await db.rpc('acquire_admin_action_lease', { p_action_key: `resend:${targetUserId}`, p_actor_user_id: actorId, p_idempotency_key: key, p_processing_ttl_secs: 60, p_result_ttl_secs: 3600 })
  if (leaseErr || !lease) {
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'resend_invite', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'Ação em andamento' } })
    throw createError({ statusCode: 409, message: 'Reenvio já em andamento por outro administrador.' })
  }
  const leaseData = lease as any

  const { data: userData } = await db.auth.admin.getUserById(targetUserId)
  if (!userData?.user?.email) {
    await db.rpc('release_admin_action_lease', { p_action_key: `resend:${targetUserId}`, p_lease_token: leaseData.lease_token, p_status: 'failed' })
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'resend_invite', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: 'User not found' } })
    throw createError({ statusCode: 404, message: 'Usuário não encontrado.' })
  }

  const { error: otpErr } = await db.auth.signInWithOtp({ email: userData.user.email, options: { shouldCreateUser: false, emailRedirectTo: confirmUrl } })
  if (otpErr) {
    await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'resend_invite', p_key: key, p_execution_token: execToken, p_status: 'failed', p_response: { error: otpErr.message } })
    throw createError({ statusCode: 504, message: 'Instabilidade temporária no envio do e-mail. Aguarde 1 minuto.' })
  }

  await db.rpc('audit_admin_invite_resent_atomic', { p_target_user_id: targetUserId, p_actor_user_id: actorId })
  await db.rpc('release_admin_action_lease', { p_action_key: `resend:${targetUserId}`, p_lease_token: leaseData.lease_token, p_status: 'completed' })
  const resp = { success: true, message: 'Convite reenviado com sucesso.' }
  await db.rpc('release_idempotency_key', { p_actor_user_id: actorId, p_operation: 'resend_invite', p_key: key, p_execution_token: execToken, p_status: 'completed', p_response: resp })
  return resp
}

export async function listAdminUsers(params: { search?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<AdminUsersListResponse> {
  const db = getSupabaseAdminClient()
  const { data, error } = await db.rpc('list_admin_users_paginated_atomic', {
    p_search_query: params.search || undefined,
    p_role: params.role || undefined,
    p_status: params.status || undefined,
    p_page: params.page || 1,
    p_limit: params.limit || 20,
  })
  if (error) throw createError({ statusCode: 500, message: 'Erro ao consultar administradores.' })
  return data as unknown as AdminUsersListResponse
}

export async function updateAdminRole(actorId: string, targetId: string, role: string) {
  const db = getSupabaseAdminClient()
  const { data, error } = await db.rpc('update_admin_user_role_atomic', { p_target_user_id: targetId, p_new_role: role, p_actor_user_id: actorId })
  if (error) {
    if (error.code === 'P0001') throw createError({ statusCode: 400, message: 'Não é possível alterar sua própria função.' })
    if (error.code === 'P0004') throw createError({ statusCode: 400, message: 'Não é possível rebaixar o único administrador ativo do sistema.' })
    throw createError({ statusCode: 400, message: error.message || 'Erro ao alterar função.' })
  }
  return data
}

export async function updateAdminStatus(actorId: string, targetId: string, isActive: boolean) {
  const db = getSupabaseAdminClient()
  const { data, error } = await db.rpc('update_admin_user_status_atomic', { p_target_user_id: targetId, p_is_active: isActive, p_actor_user_id: actorId })
  if (error) {
    if (error.code === 'P0001') throw createError({ statusCode: 400, message: 'Não é possível alterar seu próprio status.' })
    if (error.code === 'P0004') throw createError({ statusCode: 400, message: 'Não é possível desativar o único administrador ativo do sistema.' })
    if (error.code === 'P0005') throw createError({ statusCode: 400, message: 'Não é possível ativar manualmente um convite pendente. Aguarde o aceite pelo usuário.' })
    throw createError({ statusCode: 400, message: error.message || 'Erro ao alterar status.' })
  }
  return data
}

export async function acceptAdminInvite(userId: string) {
  const db = getSupabaseAdminClient()
  const { data, error } = await db.rpc('accept_admin_invite_atomic', { p_user_id: userId })
  if (error) throw createError({ statusCode: 400, message: error.message || 'Erro ao aceitar convite.' })
  return data
}

export async function getAdminAuditLog(page = 1, limit = 20, userId?: string) {
  const db = getSupabaseAdminClient()
  const clampedLimit = Math.min(Math.max(limit, 1), 50)
  const offset = (Math.max(page, 1) - 1) * clampedLimit

  let q = db.from('admin_user_audit').select('id, target_user_id, actor_user_id, action, old_role, new_role, old_is_active, new_is_active, created_at', { count: 'exact' })
  if (userId) q = q.or(`target_user_id.eq.${userId},actor_user_id.eq.${userId}`)
  const { data, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + clampedLimit - 1)
  if (error) throw createError({ statusCode: 500, message: 'Erro ao consultar auditoria.' })

  const userIds = [...new Set((data || []).flatMap((d: any) => [d.target_user_id, d.actor_user_id]))]
  const emailMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: usersData } = await db.auth.admin.listUsers()
    for (const u of usersData?.users || []) {
      if (userIds.includes(u.id)) emailMap[u.id] = u.email || ''
    }
  }

  const items: AdminUserAuditItem[] = (data || []).map((d: any) => ({
    id: d.id, target_user_id: d.target_user_id, actor_user_id: d.actor_user_id,
    target_email: emailMap[d.target_user_id] || d.target_user_id, actor_email: emailMap[d.actor_user_id] || d.actor_user_id,
    action: d.action as any, old_role: d.old_role, new_role: d.new_role, old_is_active: d.old_is_active,
    new_is_active: d.new_is_active, created_at: d.created_at,
  }))

  return {
    items,
    pagination: { page: Math.max(page, 1), limit: clampedLimit, total: count || 0, totalPages: Math.ceil((count || 0) / clampedLimit) },
  }
}
