<template>
  <div class="relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between" :class="featured ? 'bg-[#09357a] p-6 sm:p-8 border-blue-800 shadow-lg' : 'bg-blue-50/70 hover:bg-blue-50 p-6 border-blue-100/80 shadow-sm hover:shadow-md'">
    <img v-if="backgroundImage" :src="backgroundImage" alt="" aria-hidden="true" loading="lazy" class="absolute inset-0 w-full h-full object-cover object-center" />
    <div v-if="backgroundImage" aria-hidden="true" class="absolute inset-0 bg-gradient-to-r from-[#031337]/90 via-[#031337]/75 to-[#031337]/70" />
    <div class="relative z-10">
      <!-- Icon Badge -->
      <div class="rounded-xl flex items-center justify-center mb-6 shadow-md" :class="featured ? 'w-16 h-16 bg-white/15 text-white' : 'w-12 h-12 bg-[#09357a] text-white'">
        <slot name="icon">
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </slot>
      </div>

      <!-- Title -->
      <h3 class="font-bold mb-5" :class="featured ? 'text-3xl sm:text-4xl text-white' : 'text-xl text-[#09357a]'">
        {{ title }}
      </h3>

      <!-- Feature Checklist -->
      <ul :class="featured ? 'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6' : 'space-y-2.5 sm:space-y-3'">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="flex items-start space-x-3 font-medium min-w-0"
          :class="featured ? 'text-base text-blue-50' : 'text-sm text-gray-700'"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5" :class="featured ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#09357a]'">
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
  featured?: boolean
  backgroundImage?: string
}>()
</script>
