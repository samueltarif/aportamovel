import { leadArchiveSchema } from '~~/server/validators/leadSchemas'
import { setLeadArchived } from '~~/server/services/leads/leadAdminService'
import { requireAdmin } from '~~/server/utils/requireAdmin'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  // Apenas o papel admin tem permissão para arquivar
  if (admin.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Apenas administradores podem arquivar ou desarquivar leads.',
    })
  }

  const id = getRouterParam(event, 'id')
  const validId = z.string().uuid().safeParse(id)

  if (!validId.success) {
    throw createError({ statusCode: 400, message: 'ID do lead inválido.' })
  }

  const body = await readBody(event).catch(() => null)
  const parseResult = leadArchiveSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: 'Parâmetro de arquivamento inválido.' })
  }

  return await setLeadArchived(validId.data, parseResult.data.archived)
})
