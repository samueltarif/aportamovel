import { requireAdmin } from '../../../utils/requireAdmin'
import { publicationUpdateSchema } from '../../../validators/publicationSchemas'
import { updateAdminPublication } from '../../../services/publications/publicationAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID inválido.' })

  const body = await readBody(event)
  const validated = publicationUpdateSchema.parse(body)

  return await updateAdminPublication(user.id, id, validated)
})
