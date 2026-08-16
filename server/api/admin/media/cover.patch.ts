import { requireAdmin } from '../../../utils/requireAdmin'
import { mediaCoverSchema } from '../../../validators/publicationSchemas'
import { setMediaCover } from '../../../services/media/mediaAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = mediaCoverSchema.parse(body)

  return await setMediaCover(user.id, validated.publication_id, validated.media_id)
})
