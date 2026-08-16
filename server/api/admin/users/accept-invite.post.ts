import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { requireSameOrigin } from '../../../utils/requireSameOrigin'
import { acceptInviteSchema } from '../../../validators/adminUserSchemas'
import { acceptAdminInvite } from '../../../services/users/adminUserService'

export default defineEventHandler(async (event) => {
  requireSameOrigin(event)

  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Sessão inválida ou expirada. Acesse novamente pelo link recebido no e-mail.',
    })
  }

  const userId = (user.id || (user as any).sub) as string
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Não autenticado.',
    })
  }

  const rawBody = await readBody(event).catch(() => null)
  const body = (rawBody && typeof rawBody === 'object') ? rawBody : {}
  const parsed = acceptInviteSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Dados de confirmação inválidos.',
    })
  }

  return await acceptAdminInvite(userId)
})
