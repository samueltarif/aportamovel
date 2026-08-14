import { z } from 'zod'

// ─── Schema de login ───────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Informe seu e-mail.' })
    .trim()
    .toLowerCase()
    .email('Informe um e-mail válido.'),
  password: z
    .string({ required_error: 'Informe sua senha.' })
    .min(1, 'Informe sua senha.'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─── Schema de recuperação de senha ───────────────────────────
export const recoverPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Informe seu e-mail.' })
    .trim()
    .toLowerCase()
    .email('Informe um e-mail válido.'),
})

export type RecoverPasswordInput = z.infer<typeof recoverPasswordSchema>

// ─── Schema de redefinição de senha ───────────────────────────
export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: 'Informe a nova senha.' })
      .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
    confirmPassword: z
      .string({ required_error: 'Confirme a nova senha.' })
      .min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas informadas não coincidem.',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
