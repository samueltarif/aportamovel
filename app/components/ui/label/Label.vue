<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

defineProps<{
  class?: HTMLAttributes['class']
  for?: string
}>()
</script>

<template>
  <label
    data-slot="label"
    :for="$props.for"
    :class="cn(
      'text-sm font-semibold text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      $props.class,
    )"
  >
    <slot />
  </label>
</template>
