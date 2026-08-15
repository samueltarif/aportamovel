<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden">
    <!-- Efeitos sutis de fundo com cores da marca -->
    <div class="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#09357a]/5 blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#b91c1c]/5 blur-3xl" aria-hidden="true" />

    <!-- Barra de acento superior com as cores institucional (azul) e secundaria (vermelho) -->
    <div class="h-1.5 w-full bg-gradient-to-r from-[#09357a] via-[#09357a] to-[#b91c1c]" />

    <!-- Cabeçalho com logo -->
    <header class="flex justify-center pt-8 pb-4 px-4 z-10">
      <NuxtLink
        to="/"
        class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a] rounded-lg p-1.5 bg-white/80 backdrop-blur shadow-xs border border-slate-200/60"
        aria-label="A Portamóvel — ir para o site"
      >
        <img
          src="/images/logo.png"
          alt="Logo A Portamóvel"
          class="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          width="40"
          height="40"
        />
        <div class="flex flex-col leading-none pr-2">
          <span class="text-xl font-extrabold text-[#09357a] tracking-tight">A Portamóvel</span>
          <span class="text-xs font-bold text-[#b91c1c] tracking-widest uppercase mt-0.5">
            Serralheria
          </span>
        </div>
      </NuxtLink>
    </header>

    <!-- Conteúdo central -->
    <main class="flex flex-1 items-center justify-center px-4 py-8 z-10">
      <slot />
    </main>

    <!-- Rodapé discreto -->
    <footer class="py-4 text-center z-10">
      <p class="text-xs font-medium text-slate-400">
        &copy; {{ new Date().getFullYear() }} A Portamóvel. Acesso restrito.
      </p>
    </footer>
  </div>
</template>
