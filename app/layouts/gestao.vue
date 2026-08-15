<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import AdminMobileNav from '~/components/admin/AdminMobileNav.vue'
import AdminTopbar from '~/components/admin/AdminTopbar.vue'

// Inicializa o estado compartilhado único do painel (carrega /api/auth/me uma única vez)
useAdminState()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
    <!-- Linha de acento de marca no topo de toda a aplicação -->
    <div class="h-1 w-full bg-gradient-to-r from-[#09357a] via-[#09357a] to-[#b91c1c] z-50 shrink-0" />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar Desktop -->
      <AdminSidebar />

      <!-- Drawer Mobile -->
      <AdminMobileNav />

      <!-- Área de Conteúdo Principal (Topbar + Body) -->
      <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <!-- Topbar Administrativa -->
        <AdminTopbar />

        <!-- Conteúdo da Página -->
        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
