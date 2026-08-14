<script setup lang="ts">
definePageMeta({
  layout: 'gestao-publica',
})

import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import ResetPasswordForm from '~/components/auth/ResetPasswordForm.vue'

useHead({
  title: 'Redefinir Senha — Painel Administrativo | A Portamóvel',
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
          Redefinir Senha
        </CardTitle>
        <CardDescription>
          Defina sua nova senha para o Painel Administrativo
        </CardDescription>
      </CardHeader>

      <CardContent class="pt-4">
        <ResetPasswordForm />
      </CardContent>
    </Card>
  </div>
</template>
