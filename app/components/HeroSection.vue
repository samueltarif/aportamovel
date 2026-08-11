<template>
  <section id="home" class="py-10 md:py-20 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <!-- Left Content Column -->
        <div class="lg:col-span-6 space-y-5 sm:space-y-6">
          <!-- Badge -->
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#1e40af] text-white text-xs font-semibold shadow-sm">
            <svg class="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span>Desde 1986</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#09357a] leading-tight tracking-tight">
            Segurança Institucional com Precisão Técnica
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-lg text-gray-600 leading-relaxed font-medium">
            Há quase <strong class="text-gray-900 font-bold">40 anos</strong> entregando soluções robustas para condomínios. Nosso diferencial é a prontidão absoluta.
          </p>

          <!-- Red Tactical Commitment Banner -->
          <div class="bg-[#d97768] text-white rounded-xl p-4 sm:p-5 shadow-lg border border-red-300 flex items-start space-x-3 sm:space-x-4">
            <div class="p-2 sm:p-2.5 bg-white/20 rounded-lg flex-shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white" viewBox="0 0 24 24">
                <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                COMPROMISSO TÁTICO
              </h3>
              <p class="text-sm font-semibold text-white/95 mt-0.5">
                Atendimento Emergencial em até 6 horas.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Image Column -->
        <div class="lg:col-span-6">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
            <img
              src="/images/real_fleet.jpg"
              alt="A Portamóvel Instalações e Veículos"
              class="w-full h-56 sm:h-80 lg:h-[440px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="eager"
              fetchpriority="high"
            />
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-5 text-white">
              <p class="font-bold text-xs sm:text-sm text-gray-100 leading-snug">
                Rua Manoel Ramos, 26 - Jd. Maristela - Freguesia do Ó - São Paulo - SP
              </p>
              <p class="text-[11px] sm:text-xs text-gray-300 mt-1 leading-snug">
                Tel: (11) 3991-0279 / 3991-0280 / 3991-0281 | WhatsApp: (11) 91298-4416
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
