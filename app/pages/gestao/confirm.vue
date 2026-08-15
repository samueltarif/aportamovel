<script setup lang="ts">
/**
 * Página de callback PKCE do @nuxtjs/supabase.
 *
 * Configurada como 'callback' em redirectOptions.
 * Aguarda a sessão ser estabelecida após o código PKCE ser trocado.
 * Redireciona somente para destinos internos permitidos.
 * Nunca confia em redirect_to recebido da URL.
 */
definePageMeta({
  layout: 'gestao-publica',
})

import Card from '~/components/ui/card/Card.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import Alert from '~/components/ui/alert/Alert.vue'
import AlertDescription from '~/components/ui/alert/AlertDescription.vue'

const user = useSupabaseUser()
const error = ref<string | null>(null)

// Destino interno permitido após autenticação
const SAFE_REDIRECT = '/gestao'

// Aguardar a sessão ser criada pelo módulo (troca do código PKCE)
const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

watch(user, (newUser) => {
  if (newUser) {
    if (timeoutId.value) clearTimeout(timeoutId.value)
    navigateTo(SAFE_REDIRECT, { replace: true })
  }
}, { immediate: true })

onMounted(() => {
  timeoutId.value = setTimeout(() => {
    if (!user.value) {
      error.value = 'O link expirou ou é inválido. Solicite um novo link de acesso.'
    }
  }, 10000)
})

onUnmounted(() => {
  if (timeoutId.value) clearTimeout(timeoutId.value)
})

useHead({
  title: 'Confirmando acesso… | A Portamóvel',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<template>
  <div class="w-full max-w-sm text-center">
    <Card class="shadow-xl shadow-slate-900/5 border border-slate-200/80 bg-white rounded-2xl overflow-hidden relative">
      <!-- Linha de destaque no topo do Card -->
      <div class="h-1.5 w-full bg-gradient-to-r from-[#09357a] via-[#09357a] to-[#b91c1c]" />

      <CardContent class="pt-8 pb-8">
        <!-- Erro de callback -->
        <template v-if="error">
          <Alert variant="destructive" class="mb-5">
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
          <NuxtLink
            to="/gestao/recuperar-senha"
            class="text-sm font-semibold text-[#09357a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a] rounded"
          >
            Solicitar novo link
          </NuxtLink>
        </template>

        <!-- Aguardando PKCE -->
        <template v-else>
          <div
            class="h-10 w-10 animate-spin rounded-full border-4 border-[#09357a] border-t-transparent mx-auto mb-4"
            role="status"
            aria-label="Validando acesso…"
          />
          <p class="text-sm font-bold text-slate-800">Validando acesso…</p>
          <p class="text-xs text-slate-500 mt-1">Aguarde um momento.</p>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
