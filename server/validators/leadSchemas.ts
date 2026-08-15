import { z } from 'zod'

const commonFields = {
  idempotency_key: z.string().uuid(),
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120),
  phone: z.string().trim().min(8, 'Telefone inválido').max(30),
  company_or_condominium: z.string().trim().max(160).optional(),
  source_path: z.string().regex(/^\/[A-Za-z0-9\/_-]*$/, 'Caminho inválido').max(120),
  utm_source: z.string().trim().max(200).optional(),
  utm_medium: z.string().trim().max(200).optional(),
  utm_campaign: z.string().trim().max(200).optional(),
  turnstile_token: z.string().min(1, 'Token Turnstile obrigatório').max(2048),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consentimento obrigatório' }) }),
  _hp_company_title: z.string().max(0).optional(),
}

export const publicLeadSubmissionSchema = z.discriminatedUnion('form_id', [
  z.object({
    ...commonFields,
    form_id: z.literal('contact_form'),
    email: z.string().trim().email('E-mail inválido').max(254),
    message: z.string().trim().max(3000).optional(),
  }).strict(),
  z.object({
    ...commonFields,
    form_id: z.literal('quote_modal'),
    email: z.string().trim().email('E-mail inválido').max(254).optional(),
    service_name: z.string().trim().max(120).optional(),
    service_slug: z.string().trim().max(120).optional(),
    message: z.string().trim().max(3000).optional(),
  }).strict(),
])

export type PublicLeadSubmissionInput = z.infer<typeof publicLeadSubmissionSchema>

export const leadListQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().min(1)).default(1),
  limit: z.preprocess((val) => (val ? Number(val) : 20), z.number().int().min(1).max(50)).default(20),
  status: z.enum(['all', 'new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'spam']).default('all'),
  form_id: z.enum(['all', 'contact_form', 'quote_modal']).default('all'),
  period: z.enum(['7', '30', '90', 'all']).default('all'),
  archived: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
})

export const leadSearchBodySchema = z.object({
  query: z.string().trim().min(1).max(100),
  status: z.enum(['all', 'new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'spam']).default('all'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  archived: z.boolean().default(false),
}).strict()

export const leadStatusUpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'spam']),
}).strict()

export const leadNoteCreateSchema = z.object({
  note: z.string().trim().min(1, 'Observação não pode ser vazia').max(2000),
}).strict()

export const leadArchiveSchema = z.object({
  archived: z.boolean(),
}).strict()
