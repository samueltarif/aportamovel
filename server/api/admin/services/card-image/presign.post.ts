import { requireAdmin } from '../../../../utils/requireAdmin'
import { serviceCardPresignSchema } from '../../../../validators/serviceSchemas'
import { presignServiceCardImage } from '../../../../services/services/serviceCardUploadService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const body = await readBody(event)

  let validated
  try {
    validated = serviceCardPresignSchema.parse(body)
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: err.errors?.[0]?.message || 'Dados inválidos fornecidos para upload da imagem do card.',
    })
  }

  return await presignServiceCardImage({
    userId: user.id,
    serviceId: validated.target_id,
    fileExtension: validated.file_extension,
    mimeType: validated.mime_type,
    expectedSizeBytes: validated.expected_size_bytes,
  })
})
