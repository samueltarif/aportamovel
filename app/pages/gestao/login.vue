<script setup lang="ts">
definePageMeta({
  layout: 'gestao-publica',
})

import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import LoginForm from '~/components/auth/LoginForm.vue'

const user = useSupabaseUser()

// Se já houver sessão ativa, verificar autorização antes de redirecionar
onMounted(async () => {
  if (user.value) {
    try {
      const adminData = await $fetch('/api/auth/me')
      if (adminData) {
        await navigateTo('/gestao', { replace: true })
      }
    }
    catch {
      // Usuário sem autorização administrativa permanece no login
    }
  }
})

useHead({
  title: 'Login — Painel Administrativo | A Portamóvel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <div class="w-full max-w-md">
    <Card class="shadow-2xl border-0 bg-white">
      <CardHeader class="text-center pb-2">
        <CardTitle class="text-2xl font-bold text-[#09357a]">
          Acesso Administrativo
        </CardTitle>
        <CardDescription>
          Painel restrito — somente administradores autorizados
        </CardDescription>
      </CardHeader>

      <CardContent class="pt-4">
        <LoginForm @success="navigateTo('/gestao', { replace: true })" />
      </CardContent>
    </Card>
  </div>
</template>
