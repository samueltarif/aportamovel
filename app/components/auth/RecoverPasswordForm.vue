<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { recoverPasswordSchema } from '~~/shared/schemas/auth'
import { useAuth } from '~/composables/useAuth'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Alert from '~/components/ui/alert/Alert.vue'
import AlertDescription from '~/components/ui/alert/AlertDescription.vue'

const { recoverPassword, loading } = useAuth()
const successMessage = ref<string | null>(null)
const formError = ref<string | null>(null)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(recoverPasswordSchema),
})

const [email, emailAttrs] = defineField('email')

const onSubmit = handleSubmit(async (values) => {
  formError.value = null
  // Sempre retorna mensagem genérica — não revela se email existe
  successMessage.value = await recoverPassword(values)
})
</script>

<template>
  <form
    id="recover-password-form"
    novalidate
    aria-label="Formulário de recuperação de senha"
    @submit.prevent="onSubmit"
  >
    <!-- Sucesso (mensagem genérica) -->
    <Alert v-if="successMessage" variant="success" class="mb-5">
      <AlertDescription>{{ successMessage }}</AlertDescription>
    </Alert>

    <template v-if="!successMessage">
      <p class="text-sm text-muted-foreground mb-5">
        Informe seu e-mail administrativo e enviaremos as instruções para redefinir sua senha.
      </p>

      <div class="flex flex-col gap-1.5 mb-5">
        <Label for="recover-email">E-mail</Label>
        <Input
          id="recover-email"
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          autocomplete="email"
          placeholder="seu@email.com.br"
          :disabled="loading"
          :aria-invalid="!!errors.email"
          :aria-describedby="errors.email ? 'recover-email-error' : undefined"
        />
        <span
          v-if="errors.email"
          id="recover-email-error"
          role="alert"
          class="text-destructive text-xs mt-0.5"
        >{{ errors.email }}</span>
      </div>

      <Button type="submit" class="w-full" :disabled="loading" aria-busy="loading">
        <span v-if="loading" class="flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
          Enviando…
        </span>
        <span v-else>Enviar instruções</span>
      </Button>
    </template>

    <div class="mt-5 text-center">
      <NuxtLink
        to="/gestao/login"
        class="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        Voltar ao login
      </NuxtLink>
    </div>
  </form>
</template>
