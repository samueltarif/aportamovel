import { requireAdmin } from '../../../utils/requireAdmin'
import { mediaPresignSchema } from '../../../validators/publicationSchemas'
import { presignPublicationMedia } from '../../../services/media/mediaAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = mediaPresignSchema.parse(body)

  return await presignPublicationMedia({
    userId: user.id,
    publicationId: validated.target_id,
    fileExtension: validated.file_extension,
    mimeType: validated.mime_type,
    expectedSizeBytes: validated.expected_size_bytes,
  })
})
