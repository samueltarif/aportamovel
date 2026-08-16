import { requireAdmin } from '../../../utils/requireAdmin'
import { getAdminServiceById } from '../../../services/services/serviceAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID inválido.' })

  return await getAdminServiceById(id)
})
