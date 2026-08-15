<script setup lang="ts">
definePageMeta({
  layout: 'gestao-publica',
})

import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import RecoverPasswordForm from '~/components/auth/RecoverPasswordForm.vue'

useHead({
  title: 'Recuperar Senha — Painel Administrativo | A Portamóvel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <div class="w-full max-w-md">
    <Card class="shadow-xl shadow-slate-900/5 border border-slate-200/80 bg-white rounded-2xl overflow-hidden relative">
      <!-- Linha de destaque no topo do Card -->
      <div class="h-1.5 w-full bg-gradient-to-r from-[#09357a] via-[#09357a] to-[#b91c1c]" />

      <CardHeader class="text-center pb-2 pt-6">
        <CardTitle class="text-2xl font-bold text-[#09357a]">
          Recuperar Senha
        </CardTitle>
        <CardDescription class="text-slate-500 font-medium">
          Painel Administrativo — A Portamóvel
        </CardDescription>
      </CardHeader>

      <CardContent class="pt-4 pb-6">
        <RecoverPasswordForm />
      </CardContent>
    </Card>
  </div>
</template>
