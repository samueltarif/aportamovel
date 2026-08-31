import { requireAdmin } from '../../../../utils/requireAdmin'
import { reorderHeroSlides } from '../../../../services/hero/heroAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)

  if (!Array.isArray(body?.slide_ids) || body.slide_ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Lista de IDs de slides inválida.' })
  }

  return await reorderHeroSlides(user.userId, body.slide_ids)
})
