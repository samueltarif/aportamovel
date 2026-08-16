import { requireAdmin } from '../../../utils/requireAdmin'
import { serviceUpdateSchema } from '../../../validators/serviceSchemas'
import { updateAdminService, activateAdminService } from '../../../services/services/serviceAdminService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID inválido.' })

  const body = await readBody(event)

  // Se o request solicitar ativação explícita
  if (body.is_active === true) {
    return await activateAdminService(user.id, id)
  }

  const validated = serviceUpdateSchema.parse(body)
  return await updateAdminService(user.id, id, validated)
})
