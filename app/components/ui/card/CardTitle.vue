<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'
defineProps<{ class?: HTMLAttributes['class'] }>()
</script>
<template>
  <div data-slot="card-title" :class="cn('text-xl font-semibold leading-none', $props.class)">
    <slot />
  </div>
</template>
