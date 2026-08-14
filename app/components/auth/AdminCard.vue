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
  <Card class="w-full max-w-md">
    <CardHeader class="pb-2">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck class="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <CardTitle class="text-base">Acesso autorizado</CardTitle>
          <CardDescription>Painel Administrativo — A Portamóvel</CardDescription>
        </div>
      </div>
    </CardHeader>

    <CardContent class="flex flex-col gap-3 pt-2">
      <div class="rounded-lg bg-muted/50 px-4 py-3 flex flex-col gap-1">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</span>
        <span class="text-sm font-semibold break-all">{{ email }}</span>
      </div>
      <div class="rounded-lg bg-muted/50 px-4 py-3 flex flex-col gap-1">
        <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Perfil</span>
        <span class="text-sm font-semibold">{{ roleLabel[role] ?? role }}</span>
      </div>
    </CardContent>

    <CardFooter class="pt-2">
      <Button
        variant="outline"
        class="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
