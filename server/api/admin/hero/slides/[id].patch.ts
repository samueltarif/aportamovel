import { requireAdmin } from '../../../../utils/requireAdmin'
import { updateHeroSlide } from '../../../../services/hero/heroAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do slide inválido.' })

  const body = await readBody(event)
  return await updateHeroSlide(user.userId, id, {
    is_active: body?.is_active,
    title_override: body?.title_override,
  })
})
