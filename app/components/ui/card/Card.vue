<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-slot="card"
    :class="cn('bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-100 py-6 shadow-xl', $props.class)"
  >
    <slot />
  </div>
</template>
