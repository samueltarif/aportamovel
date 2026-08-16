import { z } from 'zod'

export const idempotencyKeyHeaderSchema = z
  .string({ required_error: 'Header Idempotency-Key é obrigatório.' })
  .uuid('Header Idempotency-Key deve ser um UUID v4 válido.')

export const inviteAdminSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .trim()
    .toLowerCase()
    .email('E-mail inválido.')
    .max(255, 'E-mail muito longo.'),
  role: z.enum(['admin', 'editor'], {
    required_error: 'Função é obrigatória.',
    invalid_type_error: 'Função deve ser admin ou editor.',
  }),
})

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'editor'], {
    required_error: 'Função é obrigatória.',
    invalid_type_error: 'Função deve ser admin ou editor.',
  }),
})

export const updateStatusSchema = z.object({
  is_active: z.boolean({
    required_error: 'Status é obrigatório.',
    invalid_type_error: 'Status deve ser um booleano.',
  }),
})

export const searchAdminUsersSchema = z.object({
  search: z.string().max(100, 'Termo de busca muito longo.').optional().default(''),
  role: z.enum(['all', 'admin', 'editor']).optional().default('all'),
  status: z.enum(['all', 'active', 'inactive', 'pending']).optional().default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const listAuditSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  userId: z.string().uuid('ID de usuário inválido.').optional(),
})

export const acceptInviteSchema = z.object({
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .max(128, 'A senha não pode exceder 128 caracteres.')
    .optional(),
})

export const userIdParamSchema = z.object({
  id: z.string().uuid('ID de usuário inválido.'),
})
