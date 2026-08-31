import { requireAdmin } from '../../../utils/requireAdmin'
import { getAvailableHeroMediaList } from '../../../services/hero/heroAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  await requireAdmin(event)
  const query = getQuery(event)

  return await getAvailableHeroMediaList({
    serviceId: query.service_id ? String(query.service_id) : undefined,
    search: query.search ? String(query.search) : undefined,
    page: query.page ? parseInt(String(query.page), 10) : 1,
    limit: query.limit ? parseInt(String(query.limit), 10) : 12,
  })
})
