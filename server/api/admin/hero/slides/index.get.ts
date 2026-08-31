import { requireAdmin } from '../../../../utils/requireAdmin'
import { getAdminHeroSlidesList } from '../../../../services/hero/heroAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  await requireAdmin(event)
  return await getAdminHeroSlidesList()
})
