import { requireAdmin } from '../../../utils/requireAdmin'
import { mediaReorderSchema } from '../../../validators/publicationSchemas'
import { reorderMedia } from '../../../services/media/mediaAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = mediaReorderSchema.parse(body)

  return await reorderMedia(user.id, validated.publication_id, validated.media_ids)
})
