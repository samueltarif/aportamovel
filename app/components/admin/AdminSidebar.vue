<script setup lang="ts">
import { ADMIN_NAV_ITEMS } from '~/config/adminNavigation'
import { isNavItemActive } from '~/config/adminNavigation'
import { ExternalLink, ChevronLeft, ChevronRight, LogOut } from '@lucide/vue'

const { isSidebarCollapsed, toggleSidebar, adminData, handleLogout, isLoggingOut } = useAdminState()

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
}

const visibleNavItems = computed(() => {
  return ADMIN_NAV_ITEMS.filter((item) => {
    if (item.adminOnly && adminData.value?.role !== 'admin') {
      return false
    }
    return true
  })
})
</script>

<template>
  <aside
    class="hidden lg:flex flex-col border-r border-slate-200/80 bg-white transition-all duration-200 ease-in-out relative z-20 shrink-0"
    :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
    aria-label="Navegação administrativa desktop"
  >
    <!-- Topo da Sidebar: Logo + Título + Botão de recolher -->
    <div class="h-16 px-4 flex items-center justify-between border-b border-slate-100">
      <NuxtLink to="/gestao" class="flex items-center gap-2.5 overflow-hidden group">
        <img
          src="/images/logo.png"
          alt="A Portamóvel"
          class="h-8 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
          width="32"
          height="32"
        />
        <div v-if="!isSidebarCollapsed" class="flex flex-col leading-none">
          <span class="text-sm font-extrabold text-[#09357a] tracking-tight">A Portamóvel</span>
          <span class="text-[10px] font-bold text-[#b91c1c] tracking-wider uppercase mt-0.5">
            Painel Admin
          </span>
        </div>
      </NuxtLink>

      <!-- Botão de recolher/expandir -->
      <button
        type="button"
        class="h-7 w-7 rounded-lg border border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
        :aria-label="isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'"
        @click="toggleSidebar"
      >
        <component :is="isSidebarCollapsed ? ChevronRight : ChevronLeft" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <!-- Corpo: Lista de navegação -->
    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <AdminNavItem
        v-for="item in visibleNavItems"
        :key="item.id"
        :item="item"
        :collapsed="isSidebarCollapsed"
      />

      <!-- Divisor -->
      <div class="my-3 border-t border-slate-100" />

      <!-- Item: Ver site público -->
      <div class="relative group/nav">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#09357a] transition-all"
          :class="isSidebarCollapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : ''"
        >
          <ExternalLink class="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span v-if="!isSidebarCollapsed">Ver site</span>
        </a>
        <div
          v-if="isSidebarCollapsed"
          role="tooltip"
          class="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden group-hover/nav:flex items-center whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
        >
          Ver site (abre em nova aba)
        </div>
      </div>
    </div>

    <!-- Rodapé: Usuário autenticado + Botão Sair -->
    <div class="p-3 border-t border-slate-100 bg-slate-50/50">
      <div v-if="!isSidebarCollapsed" class="flex items-center justify-between gap-2">
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
            <span class="text-xs font-bold text-slate-800 truncate" :title="adminData?.email">
              {{ adminData?.email ?? 'Carregando…' }}
            </span>
          </div>
          <span class="text-[10px] font-semibold text-slate-500 pl-3">
            {{ adminData?.role ? (roleLabel[adminData.role] ?? adminData.role) : 'Administrador' }}
          </span>
        </div>

        <button
          type="button"
          class="h-8 w-8 rounded-lg border border-red-200 text-[#b91c1c] hover:bg-red-50 flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c]"
          :disabled="isLoggingOut"
          aria-label="Encerrar sessão"
          title="Encerrar sessão"
          @click="handleLogout"
        >
          <LogOut class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <!-- Rodapé em modo recolhido -->
      <div v-else class="flex justify-center">
        <button
          type="button"
          class="h-9 w-9 rounded-lg border border-red-200 text-[#b91c1c] hover:bg-red-50 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c]"
          :disabled="isLoggingOut"
          aria-label="Encerrar sessão"
          title="Encerrar sessão"
          @click="handleLogout"
        >
          <LogOut class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </aside>
</template>
