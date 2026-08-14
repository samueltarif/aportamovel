<template>
  <section class="py-16 sm:py-24 lg:py-28 bg-white border-t border-gray-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <header class="mb-12 sm:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#09357a] tracking-tight">
          Nossa História
        </h2>
        <!-- Decorative line -->
        <div class="w-14 h-1 bg-gradient-to-r from-[#09357a] to-[#b91c1c] rounded-full mt-3 mb-4" aria-hidden="true" />
        <p class="text-sm sm:text-base text-slate-600 font-medium max-w-2xl">
          Uma trajetória construída com experiência, tecnologia e compromisso.
        </p>
      </header>

      <!-- Timeline Container -->
      <div ref="sectionRef" class="relative ml-1 sm:ml-4 md:ml-6">
        <!-- Fine Vertical Line -->
        <div
          class="absolute left-[7px] top-2.5 bottom-2.5 w-[1.5px] bg-[#09357a]/20"
          aria-hidden="true"
        />

        <ol class="space-y-10 sm:space-y-14 lg:space-y-16">
          <li
            v-for="(item, index) in timeline"
            :key="item.year"
            class="relative pl-8 sm:pl-10 group transition-all duration-500 ease-out transform"
            :class="[
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            ]"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <!-- Marker Dot -->
            <div
              class="absolute left-[2px] top-1.5 w-3 h-3 rounded-full transition-all duration-300 group-hover:scale-125 z-10"
              :class="[
                index === 0
                  ? 'bg-[#09357a] ring-4 ring-blue-50 group-hover:ring-blue-100'
                  : 'bg-[#b91c1c] ring-4 ring-red-50 group-hover:ring-red-100'
              ]"
              aria-hidden="true"
            />

            <!-- Year & Description -->
            <div class="space-y-1.5 sm:space-y-2">
              <time
                :datetime="item.year"
                class="block text-xl sm:text-2xl font-extrabold text-[#b91c1c] tracking-tight leading-none transition-colors duration-300 group-hover:text-[#991b1b]"
              >
                {{ item.year }}
              </time>
              <p class="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed max-w-2xl transition-colors duration-300 group-hover:text-slate-900 font-normal">
                {{ item.description }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TimelineItem {
  year: string
  description: string
}

const timeline: TimelineItem[] = [
  {
    year: '1986',
    description: 'Início das atividades com o objetivo de oferecer soluções em serralheria, manutenção e segurança para condomínios.'
  },
  {
    year: '1996',
    description: 'Expansão dos serviços e estruturação da equipe técnica especializada.'
  },
  {
    year: '2006',
    description: 'Ampliação da frota e investimento contínuo em tecnologia e capacitação.'
  },
  {
    year: '2016',
    description: 'Consolidação da marca Aportamovel como referência em manutenção de portões e segurança para condomínios.'
  },
  {
    year: '2026',
    description: '40 anos de história, construídos com seriedade, inovação e compromisso com cada cliente e parceiro.'
  }
]

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    isVisible.value = true
    return
  }

  if (typeof IntersectionObserver !== 'undefined' && sectionRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          isVisible.value = true
          if (observer && sectionRef.value) {
            observer.unobserve(sectionRef.value)
          }
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(sectionRef.value)
  } else {
    isVisible.value = true
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  li {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
