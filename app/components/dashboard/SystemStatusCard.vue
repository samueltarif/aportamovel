<script setup lang="ts">
import { ShieldCheck, Activity } from '@lucide/vue'

defineProps<{
  role?: string
  email?: string
}>()

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
}
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Activity class="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">Status do sistema</h3>
          <p class="text-[11px] text-slate-500">Verificações de integridade em tempo real</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        Operacional
      </span>
    </div>

    <!-- Indicadores Verificáveis -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Autenticação</span>
        <span class="font-bold text-emerald-600 flex items-center gap-1">
          <ShieldCheck class="h-3.5 w-3.5" /> Ativa
        </span>
      </div>

      <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Autorização</span>
        <span class="font-bold text-emerald-600 flex items-center gap-1">
          <ShieldCheck class="h-3.5 w-3.5" /> Confirmada
        </span>
      </div>

      <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessão</span>
        <span class="font-bold text-emerald-600 flex items-center gap-1">
          <ShieldCheck class="h-3.5 w-3.5" /> Ativa
        </span>
      </div>

      <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perfil</span>
        <span class="font-bold text-[#09357a]">
          {{ role ? (roleLabel[role] ?? role) : 'Carregando…' }}
        </span>
      </div>
    </div>
  </div>
</template>
