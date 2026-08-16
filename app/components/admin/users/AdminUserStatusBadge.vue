<script setup lang="ts">
import type { AdminUserStatus } from '~~/shared/types/adminUsers'

interface Props {
  status: AdminUserStatus
}

const props = defineProps<Props>()

const badgeConfig = computed(() => {
  switch (props.status) {
    case 'active':
      return {
        label: 'Ativo',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dotClass: 'bg-emerald-500',
      }
    case 'inactive':
      return {
        label: 'Inativo',
        classes: 'bg-red-50 text-red-700 border-red-200/80',
        dotClass: 'bg-red-500',
      }
    case 'pending':
    default:
      return {
        label: 'Pendente',
        classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dotClass: 'bg-amber-500 animate-pulse',
      }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors shadow-2xs"
    :class="badgeConfig.classes"
  >
    <span class="h-1.5 w-1.5 rounded-full shrink-0" :class="badgeConfig.dotClass" aria-hidden="true" />
    <span>{{ badgeConfig.label }}</span>
  </span>
</template>
