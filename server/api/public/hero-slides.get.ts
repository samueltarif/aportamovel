import { getPublicHeroSlidesList } from '../../services/hero/heroPublicService'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  return await getPublicHeroSlidesList()
})
