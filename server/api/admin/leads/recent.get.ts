import { getRecentLeads } from '~~/server/services/leads/leadAdminService'
import { requireAdmin } from '~~/server/utils/requireAdmin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await getRecentLeads()
})
