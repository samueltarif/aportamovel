<template>
  <div class="bg-blue-50/60 hover:bg-blue-50/90 border border-blue-100 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
    <!-- Decorative Quote Mark -->
    <div class="absolute top-4 right-6 text-blue-200 text-6xl font-serif select-none pointer-events-none opacity-60">
      “
    </div>

    <div class="relative z-10">
      <p class="text-gray-700 italic text-base sm:text-lg leading-relaxed font-medium mb-6">
        "{{ quote }}"
      </p>
    </div>

    <div class="relative z-10 border-t border-blue-100/80 pt-4">
      <h4 class="text-xs font-bold text-[#09357a] uppercase tracking-wider">
        {{ author }}
      </h4>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quote: string
  author: string
}>()
</script>
