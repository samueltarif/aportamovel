<template>
  <div class="bg-[#b91c1c] text-white py-3 px-4 text-center shadow-inner">
    <div class="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-xs sm:text-sm font-black uppercase tracking-widest">
      <svg class="w-4 h-4 fill-current animate-pulse flex-shrink-0" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <span>{{ text || 'ATENDIMENTO DE EMERGÊNCIA EM ATÉ 6 HORAS' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>()
</script>
