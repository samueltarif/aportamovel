<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
import { useAuth } from '~/composables/useAuth'
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardDescription from '~/components/ui/card/CardDescription.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import CardFooter from '~/components/ui/card/CardFooter.vue'
import Button from '~/components/ui/button/Button.vue'

defineProps<{
  email: string
  role: string
}>()

const { logout, loading } = useAuth()

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
}
</script>

<template>
  <Card class="w-full max-w-md border border-slate-200/80 shadow-md bg-white rounded-xl overflow-hidden">
    <!-- Linha de acento de marca -->
    <div class="h-1 w-full bg-gradient-to-r from-[#09357a] via-[#09357a] to-[#b91c1c]" />

    <CardHeader class="pb-2 pt-5">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#09357a] border border-blue-100">
          <ShieldCheck class="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle class="text-base font-bold text-[#09357a]">Acesso autorizado</CardTitle>
          <CardDescription class="text-slate-500 text-xs">Painel Administrativo — A Portamóvel</CardDescription>
        </div>
      </div>
    </CardHeader>

    <CardContent class="flex flex-col gap-3 pt-3">
      <div class="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex flex-col gap-1">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail</span>
        <span class="text-sm font-semibold text-slate-800 break-all">{{ email }}</span>
      </div>
      <div class="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex flex-col gap-1">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil</span>
        <span class="text-sm font-bold text-[#09357a]">{{ roleLabel[role] ?? role }}</span>
      </div>
    </CardContent>

    <CardFooter class="pt-2 pb-5">
      <Button
        variant="outline"
        class="w-full border-red-200 text-[#b91c1c] hover:bg-red-50 hover:text-red-700 font-semibold"
        :disabled="loading"
        @click="logout"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          Saindo…
        </span>
        <span v-else>Encerrar sessão</span>
      </Button>
    </CardFooter>
  </Card>
</template>
