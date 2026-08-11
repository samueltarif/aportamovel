<template>
  <section class="py-16 sm:py-24 bg-gray-50/60 border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 lg:space-y-16">
      
      <!-- TOP BLOCK: NOSSOS VALORES -->
      <div>
        <header class="mb-10 sm:mb-12 text-center sm:text-left">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#09357a] tracking-tight">
            Nossos Valores
          </h2>
          <!-- Small red accent line -->
          <div class="w-14 h-1 bg-[#b91c1c] rounded-full mt-3 mx-auto sm:mx-0" aria-hidden="true" />
        </header>

        <!-- 4 Values Container -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 lg:p-10">
          <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-gray-100">
            <li
              v-for="val in values"
              :key="val.title"
              class="lg:px-6 first:lg:pl-0 last:lg:pr-0 group flex flex-col items-center sm:items-start text-center sm:text-left space-y-3"
            >
              <!-- Icon -->
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
                :class="val.bgClass"
              >
                <svg class="w-6 h-6 fill-current" :class="val.iconColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="val.svgPath" />
                </svg>
              </div>

              <!-- Title -->
              <h3
                class="text-base sm:text-lg font-black tracking-wider uppercase transition-colors duration-300"
                :class="val.titleColor"
              >
                {{ val.title }}
              </h3>

              <!-- Description -->
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {{ val.description }}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <!-- BOTTOM BLOCK: DEDICAÇÃO E CONFIANÇA + MISSÃO E VISÃO -->
      <div class="bg-[#09357a] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xl text-white relative overflow-hidden">
        <!-- Subtitle / Header -->
        <div class="mb-8 sm:mb-10 pb-6 border-b border-blue-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-black uppercase tracking-widest text-red-400 block mb-1">
              Compromisso Institucional
            </span>
            <h3 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              DEDICAÇÃO E CONFIANÇA.
            </h3>
          </div>
          <div class="w-12 h-1 bg-[#b91c1c] rounded-full hidden sm:block" aria-hidden="true" />
        </div>

        <!-- Grid for Missão & Visão -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <!-- Missão -->
          <div class="space-y-3 group">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <!-- Target Icon -->
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <h4 class="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                NOSSA MISSÃO
              </h4>
            </div>
            <p class="text-xs sm:text-sm lg:text-base text-blue-50/90 leading-relaxed font-normal">
              Oferecer soluções de segurança e manutenção que promovam tranquilidade, valorizem o patrimônio e contribuam para o bem-estar nos condomínios.
            </p>
          </div>

          <!-- Visão -->
          <div class="space-y-3 group pt-6 md:pt-0 border-t md:border-t-0 border-blue-400/20">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <!-- Eye Icon -->
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
              <h4 class="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                NOSSA VISÃO
              </h4>
            </div>
            <p class="text-xs sm:text-sm lg:text-base text-blue-50/90 leading-relaxed font-normal">
              Ser referência em excelência e inovação no segmento, reconhecida pela qualidade dos serviços e pela confiança dos clientes.
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
interface ValueItem {
  title: string
  description: string
  bgClass: string
  iconColor: string
  titleColor: string
  svgPath: string
}

const values: ValueItem[] = [
  {
    title: 'SEGURANÇA',
    description: 'Priorizamos a proteção de pessoas e patrimônios em cada solução.',
    bgClass: 'bg-blue-50 border border-blue-100',
    iconColor: 'text-[#09357a]',
    titleColor: 'text-[#09357a]',
    svgPath: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'
  },
  {
    title: 'QUALIDADE',
    description: 'Trabalhamos com os melhores materiais, técnicas e processos para garantir resultados duradouros.',
    bgClass: 'bg-red-50 border border-red-100',
    iconColor: 'text-[#b91c1c]',
    titleColor: 'text-[#b91c1c]',
    svgPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
  },
  {
    title: 'CONFIANÇA',
    description: 'Relacionamentos baseados em transparência, respeito e compromisso com o cliente.',
    bgClass: 'bg-blue-50 border border-blue-100',
    iconColor: 'text-[#09357a]',
    titleColor: 'text-[#09357a]',
    svgPath: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
  },
  {
    title: 'AGILIDADE',
    description: 'Atendimento rápido e eficiente, com plantão 24 horas e atendimento especial em até 6 horas.',
    bgClass: 'bg-red-50 border border-red-100',
    iconColor: 'text-[#b91c1c]',
    titleColor: 'text-[#b91c1c]',
    svgPath: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'
  }
]
</script>
