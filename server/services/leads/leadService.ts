import type { PublicLeadSubmissionInput } from '~~/server/validators/leadSchemas'
import { getSupabaseAdminClient } from '~~/server/utils/supabasePrivate'
import { verifyTurnstileToken } from '~~/server/services/turnstileService'

export async function createPublicLead(input: PublicLeadSubmissionInput): Promise<{ success: boolean }> {
  const config = useRuntimeConfig()
  const privacyVersion = config.leadPrivacyNoticeVersion || process.env.LEAD_PRIVACY_NOTICE_VERSION || ''

  if (!privacyVersion) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Configuração da versão do aviso de privacidade ausente no servidor.',
    })
  }

  const supabase = getSupabaseAdminClient()

  // 1. Checar idempotência antes de consumir o token Turnstile
  const { data: existingLead } = await supabase
    .from('leads')
    .select('id')
    .eq('idempotency_key', input.idempotency_key)
    .maybeSingle()

  if (existingLead) {
    return { success: true }
  }

  // 2. Validar Turnstile no Cloudflare Siteverify
  const isValidToken = await verifyTurnstileToken({
    token: input.turnstile_token,
    expectedAction: input.form_id,
    idempotencyKey: input.idempotency_key,
  })

  if (!isValidToken) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Falha na validação de segurança anti-spam.',
    })
  }

  // 3. Montar explicitamente o objeto com whitelist estrita
  const now = new Date().toISOString()
  const leadToInsert = {
    idempotency_key: input.idempotency_key,
    full_name: input.name.trim(),
    email: input.email ? input.email.trim().toLowerCase() : null,
    phone: input.phone.trim(),
    company_or_condominium: input.company_or_condominium?.trim() || null,
    message: input.message?.trim() || null,
    service_slug: 'service_slug' in input && input.service_slug ? input.service_slug.trim() : null,
    service_name: 'service_name' in input && input.service_name ? input.service_name.trim() : null,
    form_id: input.form_id,
    source_path: input.source_path.trim(),
    utm_source: input.utm_source?.trim() || null,
    utm_medium: input.utm_medium?.trim() || null,
    utm_campaign: input.utm_campaign?.trim() || null,
    status: 'new' as const,
    consent_at: now,
    privacy_notice_version: privacyVersion,
  }

  // 4. Inserir no Supabase via cliente privilegiado
  const { error } = await supabase
    .from('leads')
    .insert(leadToInsert)

  if (error) {
    // Código PostgreSQL 23505 = unique_violation (colisão simultânea de idempotency_key)
    if (error.code === '23505') {
      return { success: true }
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Não foi possível registrar a solicitação no momento.',
    })
  }

  return { success: true }
}
