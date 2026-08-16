import { getPublicPublicationDetail } from '../../../../../services/publications/publicationPublicService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
  const serviceSlug = getRouterParam(event, 'serviceSlug')
  const publicationSlug = getRouterParam(event, 'publicationSlug')

  if (!serviceSlug || !publicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Parâmetros inválidos.' })
  }

  return await getPublicPublicationDetail(serviceSlug, publicationSlug)
})
