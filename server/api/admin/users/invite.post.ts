import { defineEventHandler, getHeader, readBody } from 'h3'
import { requireAdminRole } from '../../../utils/requireAdmin'
import { requireSameOrigin } from '../../../utils/requireSameOrigin'
import { idempotencyKeyHeaderSchema, inviteAdminSchema } from '../../../validators/adminUserSchemas'
import { inviteAdminUser } from '../../../services/users/adminUserService'

export default defineEventHandler(async (event) => {
  requireSameOrigin(event)
  const admin = await requireAdminRole(event, ['admin'])

  const rawKey = getHeader(event, 'idempotency-key')
  const keyParsed = idempotencyKeyHeaderSchema.safeParse(rawKey)
  if (!keyParsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Header Idempotency-Key obrigatório (deve ser um UUID v4 válido).',
    })
  }

  const body = await readBody(event)
  const bodyParsed = inviteAdminSchema.safeParse(body)
  if (!bodyParsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Dados de convite inválidos.',
      data: bodyParsed.error.format(),
    })
  }

  const { email, role } = bodyParsed.data
  return await inviteAdminUser(admin.userId, email, role, keyParsed.data)
})
