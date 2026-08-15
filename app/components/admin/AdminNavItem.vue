<script setup lang="ts">
import type { NavItem } from '~/config/adminNavigation'
import { isNavItemActive } from '~/config/adminNavigation'

const props = defineProps<{
  item: NavItem
  collapsed?: boolean
}>()

const route = useRoute()
const isActive = computed(() => isNavItemActive(props.item, route.path))

// Prevenir ativação por clique, Enter ou Espaço se estiver desabilitado
const handleClick = (e: MouseEvent) => {
  if (props.item.disabled) {
    e.preventDefault()
    e.stopPropagation()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (props.item.disabled && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault()
    e.stopPropagation()
  }
}
</script>

<template>
  <div class="relative group/nav">
    <component
      :is="item.disabled ? 'span' : 'NuxtLink'"
      :to="item.disabled ? undefined : item.href"
      :aria-disabled="item.disabled ? 'true' : undefined"
      :aria-current="isActive ? 'page' : undefined"
      :tabindex="item.disabled ? -1 : 0"
      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative select-none"
      :class="[
        item.disabled
          ? 'text-slate-400 cursor-not-allowed opacity-75 hover:bg-transparent'
          : isActive
            ? 'bg-[#09357a] text-white font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-[#09357a]',
        collapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : '',
      ]"
      @click="handleClick"
      @keydown="handleKeyDown"
    >
      <component
        :is="item.icon"
        class="h-4 w-4 shrink-0"
        :class="isActive ? 'text-white' : item.disabled ? 'text-slate-400' : 'text-slate-500 group-hover/nav:text-[#09357a]'"
        aria-hidden="true"
      />

      <span v-if="!collapsed" class="truncate flex-1">
        {{ item.title }}
      </span>

      <!-- Badge "Em breve" -->
      <span
        v-if="!collapsed && item.badge"
        class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/80"
      >
        {{ item.badge }}
      </span>
    </component>

    <!-- Tooltip acessível quando a sidebar estiver recolhida -->
    <div
      v-if="collapsed"
      role="tooltip"
      class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden group-hover/nav:flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
    >
      <span>{{ item.title }}</span>
      <span v-if="item.badge" class="text-[9px] font-bold text-amber-400 bg-amber-950 px-1 py-0.2 rounded">
        {{ item.badge }}
      </span>
    </div>
  </div>
</template>
