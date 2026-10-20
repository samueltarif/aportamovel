<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <WhatsAppFloat v-if="!$route.path.startsWith('/gestao') && !$route.path.startsWith('/lp/')" />
    <!-- Aviso de cookies em todo o site público (nunca no painel /gestao) -->
    <ClientOnly>
      <LpConsentBanner v-if="!$route.path.startsWith('/gestao')" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import WhatsAppFloat from '~/components/WhatsAppFloat.vue'
import LpConsentBanner from '~/components/lp/LpConsentBanner.vue'
</script>
