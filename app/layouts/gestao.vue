<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { LayoutDashboard, LogOut } from '@lucide/vue'

const { logout, loading } = useAuth()
const user = useSupabaseUser()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar administrativa -->
    <header class="bg-[#09357a] border-b border-[#002d6b] shadow-md">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <!-- Logo + título -->
        <div class="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="A Portamóvel"
            class="h-8 w-auto object-contain"
            width="32"
            height="32"
          />
          <div class="flex items-center gap-2">
            <LayoutDashboard class="h-4 w-4 text-white/70" aria-hidden="true" />
            <span class="text-sm font-semibold text-white">Painel Administrativo</span>
          </div>
        </div>

        <!-- Ações do usuário -->
        <div class="flex items-center gap-3">
          <span
            v-if="user?.email"
            class="hidden sm:block text-xs text-white/70 truncate max-w-[180px]"
            :title="user.email"
          >
            {{ user.email }}
          </span>
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1 min-h-[36px]"
            :disabled="loading"
            aria-label="Encerrar sessão"
            @click="logout"
          >
            <LogOut class="h-4 w-4" aria-hidden="true" />
            <span class="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Conteúdo da página -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>
  </div>
</template>
