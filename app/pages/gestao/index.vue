<script setup lang="ts">
/**
 * /gestao — Dashboard administrativo inicial.
 * Middleware 'gestao' aplicado: valida sessão e autorização.
 */
definePageMeta({
  middleware: ['gestao'],
  layout: 'gestao',
})

import AdminCard from '~/components/auth/AdminCard.vue'
import Alert from '~/components/ui/alert/Alert.vue'
import AlertDescription from '~/components/ui/alert/AlertDescription.vue'

// Dados do admin — verificados server-side pelo endpoint /api/auth/me
const { data: adminData, error: fetchError } = await useFetch('/api/auth/me')

useHead({
  title: 'Painel Administrativo | A Portamóvel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-foreground">Painel Administrativo</h1>
      <p class="text-sm text-muted-foreground mt-1">
        Bem-vindo ao sistema de gestão da A Portamóvel.
      </p>
    </div>

    <!-- Erro ao carregar dados -->
    <Alert v-if="fetchError" variant="destructive" class="mb-6">
      <AlertDescription>
        Não foi possível carregar os dados administrativos. Tente recarregar a página.
      </AlertDescription>
    </Alert>

    <!-- Card do administrador autenticado -->
    <div v-if="adminData" class="flex justify-center sm:justify-start">
      <AdminCard
        :email="adminData.email"
        :role="adminData.role"
      />
    </div>
  </div>
</template>
