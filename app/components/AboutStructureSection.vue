<template>
  <section class="py-12 md:py-24 bg-blue-50/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#09357a] tracking-tight">
          Estrutura que Garante Resultados
        </h2>
        <p class="mt-3 text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
          Não dependemos de terceiros. Nossa independência operacional é o que garante a velocidade e a qualidade do nosso atendimento técnico.
        </p>
      </div>

      <!-- Grid Layout: 1 col mobile, 2 col tablet, custom lg -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
        <!-- Card 1: Frota Própria (Wide) -->
        <div class="md:col-span-1 lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-blue-100/80 shadow-sm relative overflow-hidden flex flex-col justify-between group min-h-[160px]">
          <div class="relative z-10 space-y-3 sm:space-y-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#09357a] flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900">Frota Própria Registrada</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Veículos e motos estrategicamente distribuídos para garantir mobilidade rápida, superando os desafios do trânsito urbano para chegar até o seu condomínio.
            </p>
          </div>
          <!-- Faded Background Image -->
          <img
            src="/images/real_fleet.jpg"
            alt=""
            aria-hidden="true"
            class="absolute right-0 bottom-0 w-1/2 h-full object-cover opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"
            loading="lazy"
          />
        </div>

        <!-- Card 2: +40 Anos -->
        <div class="md:col-span-1 lg:col-span-5 bg-[#09357a] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center text-blue-200 mb-3 sm:mb-4">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="text-5xl sm:text-6xl font-black tracking-tight text-white mb-1">
            +40
          </div>
          <p class="text-xs font-black uppercase tracking-widest text-blue-200 mb-2 sm:mb-3">
            ANOS DE MERCADO
          </p>
          <p class="text-xs text-blue-100/90 leading-normal max-w-xs font-medium">
            Experiência comprovada na evolução tecnológica da segurança condominial.
          </p>
        </div>

        <!-- Card 3: Equipe Especializada -->
        <div class="md:col-span-1 lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-blue-100/80 shadow-sm space-y-3 sm:space-y-4">
          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#09357a] flex items-center justify-center">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-gray-900">Equipe Especializada</h3>
          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Serralheiros e técnicos qualificados para manutenção preventiva e corretiva em portões de garagem, gradis, substituição de cabos por correntes, troca de trilhos e roldanas duplas truck.
          </p>
        </div>

        <!-- Card 4: Laboratório Técnico & Oficina Interna -->
        <div class="md:col-span-1 lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-blue-100/80 shadow-sm space-y-3 sm:space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3 gap-2">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#09357a] flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1 0-1.3z"/>
                </svg>
              </div>
              <span class="inline-block bg-blue-50 text-[#09357a] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
                PRONTIDÃO 24/7
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">Oficina de Serralheria & Laboratório Interno</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Possuímos oficina completa para fabricação e reforma, bancadas de teste e estoque estratégico de peças (kits de corrente, roldanas duplas truck, trilhos e automatizadores), minimizando o tempo de inatividade no seu condomínio.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
