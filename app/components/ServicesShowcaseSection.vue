<template>
  <section class="py-12 md:py-20 bg-gray-50/50 border-t border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#09357a] text-xs font-bold uppercase tracking-wider mb-3">
          <img src="/images/logo.png" alt="A Portamóvel" class="w-4 h-4 object-contain" />
          <span>Especialistas em Condomínios</span>
        </div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#09357a] tracking-tight">
          Nossos Serviços
        </h2>
        <div class="w-16 h-1 bg-gradient-to-r from-[#09357a] to-[#b91c1c] rounded-full mx-auto mt-3 mb-4" aria-hidden="true" />
        <p class="text-sm sm:text-base text-gray-600 font-medium">
          Soluções completas com alta qualidade técnica, suporte ágil e atendimento emergencial.
        </p>
      </div>

      <!-- 5 Services Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8 items-stretch">
        <div
          v-for="service in services"
          :key="service.title"
          class="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 cursor-pointer"
          @click="$emit('select-service', service.title)"
        >
          <!-- Top Image Container -->
          <div class="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
            <img
              :src="service.image"
              :alt="service.alt"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              width="400"
              height="225"
            />
          </div>

          <!-- Circular Floating Icon -->
          <div class="relative z-10 -mt-6 sm:-mt-6 mx-auto">
            <div class="w-12 h-12 rounded-full bg-[#09357a] text-white flex items-center justify-center border-2 border-white shadow-md group-hover:scale-110 group-hover:bg-[#b91c1c] transition-all duration-300">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path :d="service.iconSvg" />
              </svg>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 sm:p-6 text-center flex flex-col justify-between flex-1 space-y-3">
            <!-- Title -->
            <h3 class="text-xs sm:text-sm lg:text-base font-extrabold text-[#09357a] group-hover:text-[#b91c1c] transition-colors duration-300 uppercase tracking-tight leading-snug">
              {{ service.title }}
            </h3>

            <!-- Small Red Accent Line -->
            <div class="w-10 h-0.5 bg-[#b91c1c] mx-auto" aria-hidden="true" />

            <!-- Description (if non-empty) -->
            <p v-if="service.description" class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {{ service.description }}
            </p>

            <!-- Action Link Button -->
            <div class="pt-2">
              <button
                type="button"
                class="inline-flex items-center text-xs font-bold text-[#09357a] group-hover:text-[#b91c1c] transition-colors space-x-1"
                aria-label="Solicitar Orçamento"
              >
                <span>Solicitar Orçamento</span>
                <svg class="w-3.5 h-3.5 fill-current transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ServiceItem {
  title: string
  description: string
  image: string
  alt: string
  iconSvg: string
  slug: string
}

defineEmits(['select-service'])

const services: ServiceItem[] = [
  {
    title: 'MANUTENÇÃO DE PORTÕES DE GARAGEM E PEDESTRES',
    description: 'Preventiva e corretiva',
    image: '/images/services/manutencao-portoes.webp',
    alt: 'Técnicos da A Portamóvel realizando manutenção de portão automático de garagem com veículo de apoio',
    iconSvg: 'M19 13H5v-2h14v2zM12 4L4 8v2h16V8l-8-4zM4 19h16v-4H4v4z',
    slug: 'manutencao-portoes',
  },
  {
    title: 'SERRALHERIA EM GERAL',
    description: 'Reformas, ajustes e fabricações',
    image: '/images/services/serralheria-geral.webp',
    alt: 'Profissional realizando serviço de serralheria com solda',
    iconSvg: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1 0-1.3z',
    slug: 'serralheria-geral',
  },
  {
    title: 'RECUPERAÇÃO E REPINTURA DE GRADIS',
    description: 'Mais beleza, proteção e valorização',
    image: '/images/services/recuperacao-gradis.webp',
    alt: 'Gradil metálico de condomínio recuperado e repintado',
    iconSvg: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
    slug: 'recuperacao-gradis',
  },
  {
    title: 'TROCA DE CABOS DE AÇO POR KIT DE CORRENTE',
    description: 'Mais segurança, menos ruídos e quebras',
    image: '/images/services/kit-corrente-portao.webp',
    alt: 'Kit de corrente e engrenagem para acionamento de portão',
    iconSvg: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
    slug: 'kit-corrente-portao',
  },
  {
    title: 'PORTAS CORTA-FOGO E ESTRUTURAS METÁLICAS',
    description: 'Ajustes, manutenção preventiva e adequação às normas',
    image: '/images/services/portas-corta-fogo.webp',
    alt: 'Porta corta-fogo para condomínios e edifícios',
    iconSvg: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
    slug: 'portas-corta-fogo',
  },
]
</script>
