import { requireAdmin } from '../../../utils/requireAdmin'
import { getAdminPublicationsList } from '../../../services/publications/publicationAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  await requireAdmin(event)
  const query = getQuery(event)

  return await getAdminPublicationsList({
    serviceId: query.service_id ? String(query.service_id) : undefined,
    status: query.status ? String(query.status) : undefined,
  })
})
