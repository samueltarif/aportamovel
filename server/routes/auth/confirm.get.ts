import { defineEventHandler, getQuery, sendRedirect, setResponseHeaders } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Headers estritos para impedir cache e vazamento de referrer
  setResponseHeaders(event, {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
    'Referrer-Policy': 'no-referrer',
  })

  const query = getQuery(event)
  const tokenHash = typeof query.token_hash === 'string' ? query.token_hash.trim() : null
  const type = typeof query.type === 'string' ? query.type.trim() : null

  // Allowlist estrita de tipos aceitos para o módulo
  if (!tokenHash || !type || !['invite', 'email'].includes(type)) {
    return sendRedirect(event, '/gestao/aceitar-convite?error=invalid_token_parameters', 303)
  }

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  })

  if (error || !data.session) {
    return sendRedirect(event, '/gestao/aceitar-convite?error=verification_failed', 303)
  }

  // Sessão gravada nos cookies seguros pelo Nitro. Redirecionamento limpo (sem token_hash na URL).
  return sendRedirect(event, `/gestao/aceitar-convite?type=${encodeURIComponent(type)}`, 303)
})
