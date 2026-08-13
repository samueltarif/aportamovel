<template>
  <div class="bg-[#002d6b] text-white border-b border-blue-900/40">
    <!-- Mobile: WhatsApp primary + phones folded -->
    <div class="sm:hidden px-4 py-2 flex items-center justify-between gap-2">
      <!-- WhatsApp CTA - primary on mobile -->
      <a
        href="https://wa.me/5511912984416?text=Ol%C3%A1%2C%20gostaria%20de%20atendimento%20via%20WhatsApp."
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs min-h-[36px]"
        aria-label="WhatsApp: (11) 91298-4416"
      >
        <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
          <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
          </svg>
        </span>
        <span>(11) 91298-4416</span>
      </a>

      <!-- Fixed phones compact row -->
      <div class="flex items-center gap-2 text-blue-200 text-[10px] font-semibold">
        <a href="tel:1139910279" class="hover:text-white transition-colors min-h-[36px] flex items-center">3991-0279</a>
        <span class="text-blue-400/40">|</span>
        <a href="tel:1139910280" class="hover:text-white transition-colors min-h-[36px] flex items-center">3991-0280</a>
      </div>
    </div>

    <!-- Desktop/Tablet: original layout -->
    <div class="hidden sm:block px-4 py-2">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <!-- Landlines list -->
        <div class="flex items-center space-x-3 sm:space-x-5 text-blue-100">
          <a href="tel:1139910279" class="flex items-center space-x-1.5 hover:text-white transition-colors">
            <svg class="w-3.5 h-3.5 text-blue-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>(11) 3991-0279</span>
          </a>
          <span class="text-blue-400/40">|</span>
          <a href="tel:1139910280" class="flex items-center space-x-1.5 hover:text-white transition-colors">
            <svg class="w-3.5 h-3.5 text-blue-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>(11) 3991-0280</span>
          </a>
        </div>

        <!-- WhatsApp CTA -->
        <a
          href="https://wa.me/5511912984416?text=Ol%C3%A1%2C%20gostaria%20de%20atendimento%20via%20WhatsApp."
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
          aria-label="WhatsApp: (11) 91298-4416"
        >
          <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs flex-shrink-0">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
          </span>
          <span>WhatsApp: (11) 91298-4416</span>
        </a>
      </div>
    </div>
  </div>
</template>
