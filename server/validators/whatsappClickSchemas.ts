import { z } from 'zod'

const opt = (max: number) => z.string().trim().max(max).optional()
const clickId = z.string().regex(/^[\w-]{10,200}$/).optional()

/** Ficha enviada pelo navegador no clique (sem dados pessoais). */
export const whatsappClickSchema = z.object({
  code: z.string().regex(/^PM-[A-Z0-9]{5}$/),
  wa_number: z.string().regex(/^\d{10,15}$/),
  cta_location: z.string().trim().min(1).max(60).regex(/^[\w-]+$/),
  page_path: z.string().max(200).regex(/^\/[\w\/.-]*$/),
  service_slug: opt(120),
  utm_source: opt(200),
  utm_medium: opt(200),
  utm_campaign: opt(200),
  utm_term: opt(200),
  utm_content: opt(200),
  gclid: clickId,
  gbraid: clickId,
  wbraid: clickId,
  referrer_host: z.string().max(120).regex(/^[a-z0-9.-]*$/i).optional(),
  landing_path: z.string().max(200).regex(/^\/[\w\/.-]*$/).optional(),
  device: z.enum(['mobile', 'tablet', 'desktop', 'unknown']).default('unknown'),
}).strict()

export type WhatsAppClickInput = z.infer<typeof whatsappClickSchema>

export const whatsappClickListQuerySchema = z.object({
  period: z.enum(['7', '30', '90', 'all']).default('30'),
  status: z.enum(['all', 'pending', 'identified', 'ignored']).default('all'),
  code: z.string().trim().toUpperCase().regex(/^(PM-)?[A-Z0-9]{1,5}$/).optional(),
})

export const whatsappClickIdentifySchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome').max(120),
  phone: z.string().trim().min(8, 'Telefone inválido').max(30),
  company_or_condominium: z.string().trim().max(160).optional(),
  note: z.string().trim().max(1000).optional(),
}).strict()

export const whatsappClickStatusSchema = z.object({
  status: z.enum(['pending', 'ignored']),
}).strict()
