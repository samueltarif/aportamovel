import { z } from 'zod'

export const serviceIconKeys = [
  'gate',
  'fence',
  'chain',
  'rail',
  'welding',
  'door',
  'roller',
  'cftv',
  'wrench',
  'shield',
] as const

export const serviceCreateSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido. Use apenas letras minúsculas, números e hífens.'),
    short_description: z.string().trim().min(3).max(200),
    description: z.string().trim().min(3).max(2000),
    icon_key: z.enum(serviceIconKeys),
    accent_variant: z.enum(['blue', 'red']).default('blue'),
    is_featured: z.boolean().default(false),
    display_order: z.number().int().default(0),
    home_display_order: z.number().int().default(0),
  })
  .strict()

export const serviceUpdateSchema = z
  .object({
    name: z.string().trim().min(3).max(120).optional(),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    short_description: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(3).max(2000).optional(),
    icon_key: z.enum(serviceIconKeys).optional(),
    accent_variant: z.enum(['blue', 'red']).optional(),
    is_featured: z.boolean().optional(),
    display_order: z.number().int().optional(),
    home_display_order: z.number().int().optional(),
  })
  .strict()

export const serviceCardPresignSchema = z
  .object({
    target_id: z.string().uuid(),
    file_extension: z.enum(['jpg', 'jpeg', 'jfif', 'png', 'webp', 'avif']),
    mime_type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    expected_size_bytes: z.number().int().positive().max(10485760), // Max 10MB
  })
  .strict()

export const serviceCardFinalizeSchema = z
  .object({
    intent_id: z.string().uuid(),
    alt_text: z.string().trim().min(3).max(200),
  })
  .strict()
