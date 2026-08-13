<template>
  <footer id="contato" class="bg-blue-50/80 border-t border-blue-100 py-10 md:py-16 text-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
        <!-- Col 1: Brand & Address -->
        <div class="space-y-4">
          <NuxtLink to="/" class="flex items-center space-x-3 group inline-flex">
            <img src="/images/logo.png" alt="A Portamóvel Serralheria" class="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            <div class="flex flex-col justify-center leading-none">
              <span class="text-xl font-extrabold text-[#09357a]">
                A Portamóvel
              </span>
              <span class="text-xs font-bold text-[#b91c1c] tracking-wider uppercase mt-1">
                Serralheria
              </span>
            </div>
          </NuxtLink>
          <p class="text-xs text-gray-600 leading-relaxed">
            © 1986-2026 A Portamóvel Serralheria.<br />
            Rua Manoel Ramos, 26 - Freguesia do Ó.
          </p>
        </div>

        <!-- Col 2: Useful Links -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-[#09357a] uppercase tracking-wider">
            Links Úteis
          </h4>
          <ul class="space-y-1 text-sm font-medium text-gray-600">
            <li><NuxtLink to="/servicos" class="flex items-center hover:text-[#09357a] transition-colors min-h-[40px]">Serviços</NuxtLink></li>
            <li><NuxtLink to="/sobre-nos" class="flex items-center hover:text-[#09357a] transition-colors min-h-[40px]">Sobre Nós</NuxtLink></li>
            <li><NuxtLink to="/contato" class="flex items-center hover:text-[#09357a] transition-colors min-h-[40px]">Contato</NuxtLink></li>
            <li class="pt-1 font-bold text-[#09357a] flex items-center space-x-1 min-h-[40px]">
              <span>🛡️ Selo Desde 1986</span>
            </li>
          </ul>
        </div>

        <!-- Col 3: Direct Contact -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-[#09357a] uppercase tracking-wider">
            Contato Direto
          </h4>
          <div class="space-y-2.5 text-sm font-medium text-gray-600">
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-[#09357a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="leading-snug">(11) 3991-0279 / 3991-0280</span>
            </div>

            <!-- WhatsApp Direct Link -->
            <div class="flex items-center space-x-2">
              <span class="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
              </span>
              <a
                href="https://wa.me/5511912984416"
                target="_blank"
                rel="noopener noreferrer"
                class="text-emerald-700 font-bold hover:underline"
              >
                WhatsApp: (11) 91298-4416
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
