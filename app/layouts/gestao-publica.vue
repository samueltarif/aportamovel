<template>
  <div class="min-h-screen bg-gradient-to-br from-[#002d6b] via-[#09357a] to-[#09357a] flex flex-col">
    <!-- Cabeçalho com logo -->
    <header class="flex justify-center pt-8 pb-4 px-4">
      <NuxtLink
        to="/"
        class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-1"
        aria-label="A Portamóvel — ir para o site"
      >
        <img
          src="/images/logo.png"
          alt="Logo A Portamóvel"
          class="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          width="40"
          height="40"
        />
        <div class="flex flex-col leading-none">
          <span class="text-xl font-extrabold text-white tracking-tight">A Portamóvel</span>
          <span class="text-xs font-bold text-[#f87171] tracking-widest uppercase mt-0.5">
            Serralheria
          </span>
        </div>
      </NuxtLink>
    </header>

    <!-- Conteúdo central -->
    <main class="flex flex-1 items-center justify-center px-4 py-8">
      <slot />
    </main>

    <!-- Rodapé discreto -->
    <footer class="py-4 text-center">
      <p class="text-xs text-white/40">
        &copy; {{ new Date().getFullYear() }} A Portamóvel. Acesso restrito.
      </p>
    </footer>
  </div>
</template>
