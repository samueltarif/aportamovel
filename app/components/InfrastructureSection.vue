<template>
  <section id="sobre" class="py-12 md:py-24 bg-[#09357a] text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <!-- Left Content -->
        <div class="lg:col-span-6 space-y-6 sm:space-y-8">
          <div>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3 sm:mb-4">
              Infraestrutura Operacional
            </h2>
            <p class="text-sm sm:text-base lg:text-lg text-blue-100/90 leading-relaxed font-normal">
              Nossa capacidade de resposta é garantida por investimentos contínuos em estrutura própria, sem terceirizações que comprometam a qualidade.
            </p>
          </div>

          <!-- Feature Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Card 1: Frota Própria -->
            <div class="bg-blue-900/60 backdrop-blur border border-blue-400/20 rounded-xl p-4 sm:p-5 hover:bg-blue-900/80 transition-all">
              <div class="flex items-center space-x-3 mb-2">
                <div class="p-2 bg-blue-500/20 rounded-lg text-blue-300 flex-shrink-0">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <h3 class="font-bold text-white text-sm sm:text-base">Frota Própria</h3>
              </div>
              <p class="text-xs text-blue-200/90 leading-normal">
                Veículos equipados para reparos imediatos em campo.
              </p>
            </div>

            <!-- Card 2: Equipe CLT -->
            <div class="bg-blue-900/60 backdrop-blur border border-blue-400/20 rounded-xl p-4 sm:p-5 hover:bg-blue-900/80 transition-all">
              <div class="flex items-center space-x-3 mb-2">
                <div class="p-2 bg-blue-500/20 rounded-lg text-blue-300 flex-shrink-0">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z"/>
                  </svg>
                </div>
                <h3 class="font-bold text-white text-sm sm:text-base">Equipe CLT</h3>
              </div>
              <p class="text-xs text-blue-200/90 leading-normal">
                100% dos técnicos registrados e treinados internamente.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Image -->
        <div class="lg:col-span-6">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-400/30 group">
            <img
              src="/images/command_center.png"
              alt="Central de Monitoramento e Operações"
              class="w-full h-52 sm:h-72 lg:h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#09357a]/70 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
