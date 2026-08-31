import { requireAdmin } from '../../../../utils/requireAdmin'
import { createHeroSlide } from '../../../../services/hero/heroAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)

  if (!body?.media_id || typeof body.media_id !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'ID da mídia é obrigatório.' })
  }

  return await createHeroSlide(user.userId, {
    media_id: body.media_id,
    title_override: body.title_override,
  })
})
