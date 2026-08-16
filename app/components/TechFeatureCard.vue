<template>
  <div class="bg-blue-50/70 hover:bg-blue-50 rounded-2xl p-6 border border-blue-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
    <div>
      <!-- Icon Badge -->
      <div class="w-12 h-12 rounded-xl bg-[#09357a] text-white flex items-center justify-center mb-6 shadow-md">
        <slot name="icon">
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </slot>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-bold text-[#09357a] mb-5">
        {{ title }}
      </h3>

      <!-- Feature Checklist -->
      <ul class="space-y-2.5 sm:space-y-3">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="flex items-start space-x-3 text-sm text-gray-700 font-medium min-w-0"
        >
          <span class="w-5 h-5 rounded-full bg-blue-100 text-[#09357a] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
            ✓
          </span>
          <span class="min-w-0 break-words">{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  items: string[]
}>()
</script>
