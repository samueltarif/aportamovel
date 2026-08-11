<template>
  <section id="servicos" class="py-16 md:py-24 bg-slate-50 border-y border-slate-200/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Promotional Header Banner -->
      <div class="bg-gradient-to-r from-[#09357a] via-[#1e40af] to-[#09357a] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-12 text-center relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <svg class="w-72 h-72 fill-current" viewBox="0 0 24 24">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1 0-1.3z"/>
          </svg>
        </div>
        
        <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-600/90 text-white text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow-sm">
          <span>SERRALHERIA ESPECIALIZADA</span>
        </div>

        <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-3">
          MANUTENÇÃO • REFORMA • RECUPERAÇÃO • REPINTURA
        </h2>

        <p class="text-lg sm:text-2xl font-extrabold text-red-200 tracking-wide max-w-4xl mx-auto mb-4">
          "Não Substitua. Recupere, renove e valorize o patrimônio do seu condomínio."
        </p>

        <p class="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto font-medium">
          Com tecnologia, experiência e uma equipe especializada, a Aportamóvel oferece serviços que garantem mais segurança, funcionalidade, durabilidade e tranquilidade no dia a dia do seu condomínio.
        </p>
      </div>

      <!-- Section Title -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <h3 class="text-2xl sm:text-3xl font-extrabold text-[#09357a]">
          Serviços de Manutenção & Serralheria Condominial
        </h3>
        <p class="mt-2 text-sm sm:text-base text-slate-600 font-medium">
          Soluções de alta resistência técnica para preservar a segurança e o valor estético do seu imóvel.
        </p>
      </div>

      <!-- 7 Main Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        <div
          v-for="service in services"
          :key="service.title"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
        >
          <!-- Top Image Container -->
          <div class="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
            <img
              :src="service.image"
              :alt="service.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <!-- Card Content -->
          <div class="p-6 flex flex-col justify-between flex-1 space-y-4">
            <div>
              <h4 class="text-base sm:text-lg font-black text-[#09357a] group-hover:text-red-700 transition-colors uppercase tracking-tight leading-snug">
                {{ service.title }}
              </h4>
              <div class="w-12 h-1 bg-red-600 rounded-full my-3" />
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {{ service.description }}
              </p>
            </div>

            <!-- WhatsApp Action Button -->
            <div class="pt-2 border-t border-slate-100">
              <a
                :href="getWhatsappUrl(service.title)"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
                <span>Solicitar Orçamento</span>
              </a>
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
}

const services: ServiceItem[] = [
  {
    title: 'Manutenção de Portões de Garagem e Pedestres',
    description: 'Manutenção preventiva e corretiva em portões de garagem e pedestres de todos os modelos e marcas, garantindo o perfeito funcionamento, segurança e conforto dos usuários.',
    image: '/images/services/manutencao-portoes.webp'
  },
  {
    title: 'Recuperação, Fabricação e Repintura de Gradis',
    description: 'Recuperamos e fabricamos gradis danificados por ferrugem, impactos ou desgaste do tempo, com repintura profissional que devolve a beleza, proteção e durabilidade.',
    image: '/images/services/recuperacao-gradis.webp'
  },
  {
    title: 'Troca de Cabo de Aço por Kit de Corrente',
    description: 'Substituímos cabos de aço por kits de corrente, reduzindo quebras, ruídos e manutenções frequentes, aumentando a segurança e a durabilidade do portão.',
    image: '/images/services/kit-corrente-portao.webp'
  },
  {
    title: 'Troca de Trilhos Inferior e Superior',
    description: 'A substituição de trilhos desgastados garante o deslizamento suave do portão, evitando desalinhamentos, ruídos e danos aos componentes.',
    image: '/images/services/troca-trilhos.webp'
  },
  {
    title: 'Serralheria em Geral',
    description: 'Serviços de serralheria para portões, portas, grades, corrimãos e estruturas metálicas em geral. Recuperação, fabricação e acabamento com qualidade que valorizam o patrimônio do condomínio.',
    image: '/images/services/serralheria-geral.webp'
  },
  {
    title: 'Portas Corta-Fogo',
    description: 'Manutenção, ajuste e recuperação de portas corta-fogo, garantindo a conformidade com as normas de segurança e a proteção do seu condomínio.',
    image: '/images/services/portas-corta-fogo.webp'
  },
  {
    title: 'Troca de Roldanas Simples por Roldanas Duplas (Truck)',
    description: 'A troca proporciona menor desgaste, mais estabilidade e maior vida útil para portões deslizantes, evitando travamentos e manutenções constantes.',
    image: '/images/services/roldanas-duplas-truck.webp'
  }
]

function getWhatsappUrl(serviceTitle: string): string {
  const text = encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o serviço: ${serviceTitle}.`)
  return `https://wa.me/5511912984416?text=${text}`
}
</script>
