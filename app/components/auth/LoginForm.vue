<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '../../../shared/schemas/auth'
import { useAuth } from '~/composables/useAuth'
import { Eye, EyeOff } from '@lucide/vue'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Alert from '~/components/ui/alert/Alert.vue'
import AlertDescription from '~/components/ui/alert/AlertDescription.vue'

const { login, loading, error } = useAuth()
const showPassword = ref(false)
const emit = defineEmits<{ success: [] }>()

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  const ok = await login(values)
  if (ok) emit('success')
})
</script>

<template>
  <form
    id="login-form"
    novalidate
    aria-label="Formulário de acesso administrativo"
    @submit.prevent="onSubmit"
  >
    <!-- Campo de e-mail -->
    <div class="flex flex-col gap-1.5 mb-4">
      <Label for="login-email">E-mail</Label>
      <Input
        id="login-email"
        v-model="email"
        v-bind="emailAttrs"
        type="email"
        autocomplete="email"
        placeholder="seu@email.com.br"
        :disabled="loading"
        :aria-invalid="!!errors.email"
        :aria-describedby="errors.email ? 'login-email-error' : undefined"
      />
      <span
        v-if="errors.email"
        id="login-email-error"
        role="alert"
        class="text-destructive text-xs mt-0.5"
      >{{ errors.email }}</span>
    </div>

    <!-- Campo de senha -->
    <div class="flex flex-col gap-1.5 mb-2">
      <Label for="login-password">Senha</Label>
      <div class="relative">
        <Input
          id="login-password"
          v-model="password"
          v-bind="passwordAttrs"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="••••••••"
          :disabled="loading"
          class="pr-10"
          :aria-invalid="!!errors.password"
          :aria-describedby="errors.password ? 'login-password-error' : undefined"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
          :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
          :aria-pressed="showPassword"
          @click="showPassword = !showPassword"
        >
          <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <span
        v-if="errors.password"
        id="login-password-error"
        role="alert"
        class="text-destructive text-xs mt-0.5"
      >{{ errors.password }}</span>
    </div>

    <!-- Link recuperação -->
    <div class="flex justify-end mb-5">
      <NuxtLink
        to="/gestao/recuperar-senha"
        class="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        Esqueci minha senha
      </NuxtLink>
    </div>

    <!-- Erro global -->
    <Alert v-if="error" variant="destructive" class="mb-4">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Botão enviar -->
    <Button
      type="submit"
      class="w-full"
      :disabled="loading"
      aria-busy="loading"
    >
      <span v-if="loading" class="flex items-center gap-2">
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
        Entrando…
      </span>
      <span v-else>Entrar</span>
    </Button>
  </form>
</template>
