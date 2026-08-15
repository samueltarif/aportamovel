<script setup lang="ts">
import { ADMIN_NAV_ITEMS } from '~/config/adminNavigation'
import { ExternalLink, X, LogOut } from '@lucide/vue'

const { isMobileNavOpen, closeMobileNav, adminData, handleLogout, isLoggingOut } = useAdminState()

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
}

// Fechar ao pressionar a tecla Escape
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileNavOpen.value) {
    closeMobileNav()
  }
}

// Bloquear rolagem do corpo quando o drawer mobile estiver aberto
watch(isMobileNavOpen, (open) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : ''
  }
}, { immediate: true })

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop de fundo -->
    <Transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-150">
      <div
        v-if="isMobileNavOpen"
        class="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
        aria-hidden="true"
        @click="closeMobileNav"
      />
    </Transition>

    <!-- Drawer lateral móvel -->
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isMobileNavOpen"
        class="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col border-r border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação móvel"
      >
        <!-- Topo do Drawer -->
        <div class="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              alt="A Portamóvel"
              class="h-8 w-auto object-contain"
              width="32"
              height="32"
            />
            <div class="flex flex-col leading-none">
              <span class="text-sm font-extrabold text-[#09357a]">A Portamóvel</span>
              <span class="text-[10px] font-bold text-[#b91c1c] tracking-wider uppercase mt-0.5">
                Painel Admin
              </span>
            </div>
          </div>

          <button
            type="button"
            class="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
            aria-label="Fechar menu"
            @click="closeMobileNav"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Lista de itens -->
        <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div v-for="item in ADMIN_NAV_ITEMS" :key="item.id" @click="closeMobileNav">
            <AdminNavItem :item="item" />
          </div>

          <div class="my-3 border-t border-slate-100" />

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#09357a] transition-all"
            @click="closeMobileNav"
          >
            <ExternalLink class="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Ver site público</span>
          </a>
        </div>

        <!-- Rodapé do Mobile Drawer com Usuário + Sair -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <span class="text-xs font-bold text-slate-800 truncate">
                {{ adminData?.email ?? 'Administrador' }}
              </span>
            </div>
            <span class="text-[10px] font-semibold text-slate-500 pl-3">
              {{ adminData?.role ? (roleLabel[adminData.role] ?? adminData.role) : 'Administrador' }}
            </span>
          </div>

          <button
            type="button"
            class="flex items-center gap-1 text-xs font-bold text-[#b91c1c] hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c]"
            :disabled="isLoggingOut"
            @click="handleLogout"
          >
            <LogOut class="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
