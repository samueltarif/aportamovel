import { requireAdmin } from '../../../utils/requireAdmin'
import { serviceCreateSchema } from '../../../validators/serviceSchemas'
import { createAdminService } from '../../../services/services/serviceAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = serviceCreateSchema.parse(body)

  return await createAdminService(user.id, validated)
})
