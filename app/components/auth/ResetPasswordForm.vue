<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { resetPasswordSchema } from '~~/shared/schemas/auth'
import { Eye, EyeOff } from '@lucide/vue'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Alert from '~/components/ui/alert/Alert.vue'
import AlertDescription from '~/components/ui/alert/AlertDescription.vue'

const supabase = useSupabaseClient()
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const isRecoveryMode = ref(false)

const user = useSupabaseUser()
const route = useRoute()

// Uma única subscription — cancelada em onUnmounted
let unsubscribe: (() => void) | null = null

onMounted(() => {
  // Verificar se o usuário acessou com código de recuperação ou sessão ativa
  const hasRecoveryToken =
    !!route.query.code ||
    (typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token') ||
        window.location.hash.includes('type=recovery')))

  if (hasRecoveryToken || user.value) {
    isRecoveryMode.value = true
  }

  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
      isRecoveryMode.value = true
    }
  })
  unsubscribe = data.subscription.unsubscribe
})

onUnmounted(() => {
  unsubscribe?.()
})

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
})

const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  // Validar estado de recuperação antes de permitir a atualização
  if (!isRecoveryMode.value) {
    error.value = 'Link de redefinição inválido ou expirado. Solicite um novo link.'
    return
  }

  loading.value = true
  error.value = null

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (updateError) {
      error.value = 'Não foi possível redefinir a senha. Tente novamente ou solicite um novo link.'
      return
    }

    success.value = true
    isRecoveryMode.value = false

    // Encerrar sessão após redefinição para forçar novo login
    await supabase.auth.signOut()

    // Redirecionar para login após breve confirmação
    setTimeout(() => navigateTo('/gestao/login', { replace: true }), 2500)
  }
  catch {
    error.value = 'Não foi possível realizar o acesso. Tente novamente.'
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Sucesso -->
    <Alert v-if="success" variant="success" class="mb-4">
      <AlertDescription>
        Senha redefinida com sucesso! Redirecionando para o login…
      </AlertDescription>
    </Alert>

    <!-- Aguardando token de recuperação -->
    <div v-else-if="!isRecoveryMode" class="text-center py-4">
      <p class="text-sm text-muted-foreground">
        Aguardando validação do link de recuperação…
      </p>
      <p class="text-xs text-muted-foreground mt-2">
        Se o link expirou,
        <NuxtLink to="/gestao/recuperar-senha" class="text-primary hover:underline">
          solicite um novo
        </NuxtLink>.
      </p>
    </div>

    <!-- Formulário de redefinição -->
    <form
      v-else
      id="reset-password-form"
      novalidate
      aria-label="Formulário de redefinição de senha"
      @submit.prevent="onSubmit"
    >
      <Alert v-if="error" variant="destructive" class="mb-4">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <div class="flex flex-col gap-1.5 mb-4">
        <Label for="reset-password">Nova senha</Label>
        <div class="relative">
          <Input
            id="reset-password"
            v-model="password"
            v-bind="passwordAttrs"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
            :disabled="loading"
            class="pr-10"
            :aria-invalid="!!errors.password"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <span v-if="errors.password" role="alert" class="text-destructive text-xs mt-0.5">
          {{ errors.password }}
        </span>
      </div>

      <div class="flex flex-col gap-1.5 mb-5">
        <Label for="reset-confirm">Confirmar nova senha</Label>
        <div class="relative">
          <Input
            id="reset-confirm"
            v-model="confirmPassword"
            v-bind="confirmPasswordAttrs"
            :type="showConfirm ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Repita a nova senha"
            :disabled="loading"
            class="pr-10"
            :aria-invalid="!!errors.confirmPassword"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
            :aria-label="showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'"
            @click="showConfirm = !showConfirm"
          >
            <component :is="showConfirm ? EyeOff : Eye" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <span v-if="errors.confirmPassword" role="alert" class="text-destructive text-xs mt-0.5">
          {{ errors.confirmPassword }}
        </span>
      </div>

      <Button type="submit" class="w-full" :disabled="loading">
        <span v-if="loading" class="flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
          Salvando…
        </span>
        <span v-else>Redefinir senha</span>
      </Button>
    </form>
  </div>
</template>
