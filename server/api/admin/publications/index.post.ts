import { requireAdmin } from '../../../utils/requireAdmin'
import { publicationCreateSchema } from '../../../validators/publicationSchemas'
import { createAdminPublication } from '../../../services/publications/publicationAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = publicationCreateSchema.parse(body)

  return await createAdminPublication(user.id, validated)
})
