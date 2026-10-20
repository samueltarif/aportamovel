<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <WhatsAppFloat v-if="!$route.path.startsWith('/gestao') && !$route.path.startsWith('/lp/')" />
  </div>
</template>

<script setup lang="ts">
import WhatsAppFloat from '~/components/WhatsAppFloat.vue'
</script>
