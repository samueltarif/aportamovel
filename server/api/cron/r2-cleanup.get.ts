import { processR2CleanupQueue } from '../../services/media/r2CleanupService'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization')
  const cronSecret = process.env.CRON_SECRET || ''

  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      throw createError({ statusCode: 401, statusMessage: 'Não autorizado.' })
    }
  }

  const result = await processR2CleanupQueue(20)
  return {
    success: true,
    timestamp: new Date().toISOString(),
    ...result,
  }
})
