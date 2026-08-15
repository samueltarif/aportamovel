<script setup lang="ts">
import { Menu, LogOut, ShieldCheck } from '@lucide/vue'
import { ADMIN_NAV_ITEMS, isNavItemActive, type NavItem } from '~/config/adminNavigation'

const { toggleMobileNav, adminData, handleLogout, isLoggingOut } = useAdminState()
const route = useRoute()

// Calcular o item atual baseado na rota ativa
const activeNavItem = computed<NavItem>(() => {
  return ADMIN_NAV_ITEMS.find(item => isNavItemActive(item, route.path)) || ADMIN_NAV_ITEMS[0]!
})

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
}
</script>

<template>
  <header class="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
    <div class="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
      <!-- Lado Esquerdo: Hamburger Mobile + Breadcrumb + Título -->
      <div class="flex items-center gap-3 min-w-0">
        <button
          type="button"
          class="lg:hidden h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
          aria-label="Abrir menu de navegação"
          @click="toggleMobileNav"
        >
          <Menu class="h-5 w-5" aria-hidden="true" />
        </button>

        <div class="flex flex-col min-w-0">
          <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Painel</span>
            <span class="text-slate-300">/</span>
            <span class="font-semibold text-[#09357a] truncate">{{ activeNavItem.title }}</span>
          </nav>
          <h1 class="text-base font-bold text-slate-900 truncate leading-tight">
            {{ activeNavItem.title }}
          </h1>
        </div>
      </div>

      <!-- Lado Direito: Indicador discreto de sessão ativa + Usuário + Logout -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- Indicador visual de sessão ativa -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-700">
          <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>Sessão Ativa</span>
        </div>

        <!-- Usuário autenticado (Compacto no desktop) -->
        <div v-if="adminData?.email" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
          <ShieldCheck class="h-3.5 w-3.5 text-[#09357a]" aria-hidden="true" />
          <span class="truncate max-w-[160px]">{{ adminData.email }}</span>
        </div>

        <!-- Ação Sair na Topbar -->
        <button
          type="button"
          class="flex items-center gap-1.5 text-xs font-bold text-[#b91c1c] hover:bg-red-50 active:bg-red-100 border border-red-200/80 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c] min-h-[36px]"
          :disabled="isLoggingOut"
          aria-label="Encerrar sessão"
          @click="handleLogout"
        >
          <LogOut class="h-3.5 w-3.5" aria-hidden="true" />
          <span class="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>
  </header>
</template>
