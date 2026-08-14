<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'
defineProps<{ class?: HTMLAttributes['class'] }>()
</script>
<template>
  <div data-slot="card-description" :class="cn('text-gray-500 text-sm', $props.class)">
    <slot />
  </div>
</template>
