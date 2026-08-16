import { requireAdmin } from '../../../../utils/requireAdmin'
import { serviceCardPresignSchema } from '../../../../validators/serviceSchemas'
import { presignServiceCardImage } from '../../../../services/services/serviceCardUploadService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const validated = serviceCardPresignSchema.parse(body)

  return await presignServiceCardImage({
    userId: user.id,
    serviceId: validated.target_id,
    fileExtension: validated.file_extension,
    mimeType: validated.mime_type,
    expectedSizeBytes: validated.expected_size_bytes,
  })
})
