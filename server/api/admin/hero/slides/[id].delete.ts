import { requireAdmin } from '../../../../utils/requireAdmin'
import { deleteHeroSlide } from '../../../../services/hero/heroAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do slide inválido.' })

  return await deleteHeroSlide(user.userId, id)
})
