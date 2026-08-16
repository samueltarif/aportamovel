import { requireAdmin } from '../../../utils/requireAdmin'
import { getAdminServicesList } from '../../../services/services/serviceAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  await requireAdmin(event)
  return await getAdminServicesList()
})
