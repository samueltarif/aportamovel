<template>
  <div class="bg-white rounded-2xl p-5 sm:p-8 border border-blue-100/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group">
    <div>
      <!-- Top Header Row -->
      <div class="flex items-start justify-between mb-4 sm:mb-5 gap-2">
        <!-- Icon Badge -->
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#09357a] flex items-center justify-center shadow-xs flex-shrink-0">
          <slot name="icon">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
          </slot>
        </div>

        <!-- Optional Badge -->
        <span
          v-if="badge"
          class="bg-[#d92626] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-1 rounded shadow-xs leading-tight text-center"
        >
          {{ badge }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-[#09357a] mb-2 sm:mb-3">
        {{ title }}
      </h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 leading-relaxed font-normal mb-5 sm:mb-6">
        {{ description }}
      </p>

      <!-- Checklist -->
      <ul class="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="flex items-start space-x-3 text-sm text-gray-700 font-medium min-w-0"
        >
          <span class="w-5 h-5 rounded-full bg-blue-100/80 text-[#09357a] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
            ✓
          </span>
          <span class="min-w-0 break-words">{{ item }}</span>
        </li>
      </ul>
    </div>

    <!-- Action Button -->
    <button
      @click="$emit('request-quote', title)"
      :class="[
        'w-full py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center space-x-2 transition-all active:scale-[0.98] min-h-[48px]',
        isPrimaryAction
          ? 'bg-[#09357a] text-white hover:bg-[#07285c] shadow-md'
          : 'border-2 border-[#09357a] text-[#09357a] hover:bg-blue-50'
      ]"
    >
      <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
      <span>SOLICITE ORÇAMENTO</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  items: string[]
  badge?: string
  isPrimaryAction?: boolean
}>()

defineEmits(['request-quote'])
</script>
