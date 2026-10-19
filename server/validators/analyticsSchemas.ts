import { z } from 'zod'
import {
  MAX_CUSTOM_RANGE_DAYS,
  daysBetweenInclusive,
  isValidDateString,
  todayInSaoPaulo,
} from '~/../server/services/posthog/analyticsRange'

const dateString = z.string().trim()

export const analyticsQuerySchema = z
  .object({
    period: z.enum(['today', '7', '30', '90', 'custom']).default('30'),
    from: dateString.optional(),
    to: dateString.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.period !== 'custom') return

    if (!val.from || !val.to) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe a data inicial e a data final.' })
      return
    }
    if (!isValidDateString(val.from) || !isValidDateString(val.to)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Datas inválidas. Use o formato AAAA-MM-DD.' })
      return
    }
    if (val.from > val.to) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A data inicial deve ser anterior ou igual à data final.' })
      return
    }
    if (val.to > todayInSaoPaulo()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A data final não pode estar no futuro.' })
      return
    }
    if (daysBetweenInclusive(val.from, val.to) > MAX_CUSTOM_RANGE_DAYS) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `O intervalo máximo é de ${MAX_CUSTOM_RANGE_DAYS} dias.` })
    }
  })
  .transform(val => ({
    key: val.period,
    from: val.period === 'custom' ? val.from : undefined,
    to: val.period === 'custom' ? val.to : undefined,
  }))

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>
