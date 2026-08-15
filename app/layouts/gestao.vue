<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { LayoutDashboard, LogOut } from '@lucide/vue'

const { logout, loading } = useAuth()
const user = useSupabaseUser()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <!-- Linha de acento de marca -->
    <div class="h-1 w-full bg-gradient-to-r from-[#09357a] via-[#09357a] to-[#b91c1c]" />

    <!-- Navbar administrativa limpa -->
    <header class="bg-white border-b border-slate-200/80 shadow-xs">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Logo + título -->
        <NuxtLink to="/gestao" class="flex items-center gap-3 group">
          <img
            src="/images/logo.png"
            alt="A Portamóvel"
            class="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            width="36"
            height="36"
          />
          <div class="flex items-center gap-2.5">
            <div class="flex flex-col leading-none">
              <span class="text-base font-extrabold text-[#09357a] tracking-tight">A Portamóvel</span>
              <span class="text-[10px] font-bold text-[#b91c1c] tracking-widest uppercase mt-0.5">
                Serralheria
              </span>
            </div>
            <span class="hidden sm:inline-block h-4 w-px bg-slate-200" aria-hidden="true" />
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/60">
              <LayoutDashboard class="h-3.5 w-3.5 text-[#09357a]" aria-hidden="true" />
              <span class="text-xs font-semibold text-slate-700">Painel Administrativo</span>
            </div>
          </div>
        </NuxtLink>

        <!-- Ações do usuário -->
        <div class="flex items-center gap-3">
          <div
            v-if="user?.email"
            class="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200"
            :title="user.email"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span class="truncate max-w-[180px]">{{ user.email }}</span>
          </div>

          <button
            class="flex items-center gap-1.5 text-xs font-bold text-[#b91c1c] hover:bg-red-50 active:bg-red-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c] rounded-lg px-3 py-1.5 min-h-[36px] border border-red-200"
            :disabled="loading"
            aria-label="Encerrar sessão"
            @click="logout"
          >
            <LogOut class="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Conteúdo da página -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>
  </div>
</template>
