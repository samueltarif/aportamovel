import { requireAdmin } from '../../../../utils/requireAdmin'
import { archiveAdminPublication } from '../../../../services/publications/publicationAdminService'
import { z } from 'zod'

const archiveSchema = z.object({
  archived: z.boolean(),
}).strict()

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)

  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Apenas administradores podem arquivar publicações.' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID inválido.' })

  const body = await readBody(event)
  const { archived } = archiveSchema.parse(body)

  return await archiveAdminPublication(user.id, id, archived)
})
