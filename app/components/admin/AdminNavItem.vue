<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { NavItem } from '~/config/adminNavigation'
import { isNavItemActive } from '~/config/adminNavigation'

const props = defineProps<{
  item: NavItem
  collapsed?: boolean
}>()

defineEmits<{
  (e: 'navigate'): void
}>()

const route = useRoute()
const isActive = computed(() => isNavItemActive(props.item, route.path))
</script>

<template>
  <div class="relative group/nav">
    <!-- Link Habilitado: NuxtLink Real -->
    <NuxtLink
      v-if="!item.disabled"
      :to="item.to"
      :aria-current="isActive ? 'page' : undefined"
      class="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
      :class="[
        isActive
          ? 'bg-[#09357a] text-white font-bold shadow-xs'
          : 'text-slate-600 hover:bg-slate-100 hover:text-[#09357a]',
        collapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : '',
      ]"
      @click="$emit('navigate')"
    >
      <component
        :is="item.icon"
        class="h-4 w-4 shrink-0 pointer-events-none"
        :class="isActive ? 'text-white' : 'text-slate-500 group-hover/nav:text-[#09357a]'"
        aria-hidden="true"
      />

      <span v-if="!collapsed" class="truncate flex-1 pointer-events-none">
        {{ item.title }}
      </span>

      <span
        v-if="!collapsed && item.badge"
        class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/80 pointer-events-none"
      >
        {{ item.badge }}
      </span>
    </NuxtLink>

    <!-- Item Desabilitado: Elemento Não Clicável -->
    <div
      v-else
      aria-disabled="true"
      tabindex="-1"
      class="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed opacity-75 select-none"
      :class="collapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : ''"
    >
      <component
        :is="item.icon"
        class="h-4 w-4 shrink-0 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />

      <span v-if="!collapsed" class="truncate flex-1 pointer-events-none">
        {{ item.title }}
      </span>

      <span
        v-if="!collapsed && item.badge"
        class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 border border-slate-200/80 pointer-events-none"
      >
        {{ item.badge }}
      </span>
    </div>

    <!-- Tooltip Acessível no Modo Recolhido -->
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
