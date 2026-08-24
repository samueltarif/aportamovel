import { z } from 'zod'

export const publicationCreateSchema = z
  .object({
    service_id: z.string().uuid(),
    title: z.string().trim().min(3).max(160),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido. Use apenas letras minúsculas, números e hífens.'),
    summary: z.string().trim().min(3).max(300),
    description: z.string().trim().min(3).max(4000),
    display_order: z.number().int().default(0),
  })
  .strict()

export const publicationUpdateSchema = z
  .object({
    service_id: z.string().uuid().optional(),
    title: z.string().trim().min(3).max(160).optional(),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    summary: z.string().trim().min(3).max(300).optional(),
    description: z.string().trim().min(3).max(4000).optional(),
    display_order: z.number().int().optional(),
  })
  .strict()

export const mediaPresignSchema = z
  .object({
    target_id: z.string().uuid(),
    file_extension: z.enum(['jpg', 'jpeg', 'jfif', 'png', 'webp', 'avif', 'mp4', 'webm']),
    mime_type: z.enum([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
    ]),
    expected_size_bytes: z.number().int().positive().max(104857600), // Max 100MB
  })
  .strict()
  .refine(
    (data) => {
      if (data.mime_type.startsWith('image/') && data.expected_size_bytes > 10485760) {
        return false
      }
      return true
    },
    { message: 'Imagens não podem ultrapassar 10MB.' }
  )

export const mediaFinalizeSchema = z
  .object({
    intent_id: z.string().uuid(),
    alt_text: z.string().trim().min(3).max(200),
    caption: z.string().trim().max(500).optional(),
    media_stage: z.enum(['before', 'after', 'general']).default('general'),
    is_cover: z.boolean().default(false),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    duration_seconds: z.number().positive().max(600).optional(),
  })
  .strict()

export const mediaReorderSchema = z
  .object({
    publication_id: z.string().uuid(),
    media_ids: z.array(z.string().uuid()).min(1).max(6),
  })
  .strict()

export const mediaCoverSchema = z
  .object({
    publication_id: z.string().uuid(),
    media_id: z.string().uuid(),
  })
  .strict()
