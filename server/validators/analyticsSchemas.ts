import { z } from 'zod'

export const analyticsQuerySchema = z.object({
  period: z
    .enum(['7', '30', '90'])
    .default('30')
    .transform(val => Number(val) as 7 | 30 | 90),
})

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>
