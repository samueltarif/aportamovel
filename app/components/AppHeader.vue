<template>
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
    <!-- Top Phone & WhatsApp Bar -->
    <TopPhoneBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center space-x-3 flex-shrink-0 group" @click="closeMobileMenu">
        <img
          src="/images/logo.png"
          alt="A Portamóvel Serralheria"
          class="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
        />
        <div class="flex flex-col justify-center leading-none">
          <span class="text-lg sm:text-2xl font-extrabold text-[#09357a] tracking-tight">
            A Portamóvel
          </span>
          <span class="text-xs sm:text-sm font-bold text-[#b91c1c] tracking-wider uppercase mt-1">
            Serralheria
          </span>
        </div>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-8" aria-label="Navegação principal">
        <NuxtLink
          to="/"
          class="text-sm font-medium text-gray-600 hover:text-[#09357a] transition-colors pb-1 border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a] rounded"
          active-class="!font-bold !text-[#09357a] !border-[#09357a]"
        >Home</NuxtLink>
        <NuxtLink
          to="/servicos"
          class="text-sm font-medium text-gray-600 hover:text-[#09357a] transition-colors pb-1 border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a] rounded"
          active-class="!font-bold !text-[#09357a] !border-[#09357a]"
        >Serviços</NuxtLink>
        <NuxtLink
          to="/sobre-nos"
          class="text-sm font-medium text-gray-600 hover:text-[#09357a] transition-colors pb-1 border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a] rounded"
          active-class="!font-bold !text-[#09357a] !border-[#09357a]"
        >Sobre Nós</NuxtLink>
        <NuxtLink
          to="/contato"
          class="text-sm font-medium text-gray-600 hover:text-[#09357a] transition-colors pb-1 border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a] rounded"
          active-class="!font-bold !text-[#09357a] !border-[#09357a]"
        >Contato</NuxtLink>
      </nav>

      <!-- Right Side: Emergency Button + Hamburger -->
      <div class="flex items-center space-x-2">
        <!-- Emergency Callout Button (hidden on very small screens) -->
        <button
          @click="$emit('open-emergency')"
          class="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#b91c1c] text-white shadow-md hover:bg-[#991b1b] transition-all hover:scale-105 active:scale-95 space-x-2 text-center"
          aria-label="Abrir atendimento emergencial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 fill-current animate-pulse flex-shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div class="flex flex-col items-center justify-center text-center">
            <span class="text-xs font-bold uppercase tracking-wider hidden lg:inline leading-tight">
              Atendimento Emergencial
            </span>
            <span class="text-xs font-bold uppercase tracking-wider lg:hidden leading-tight">
              Emergência
            </span>
            <span class="text-[10px] sm:text-[11px] font-medium normal-case text-red-100 tracking-normal leading-tight mt-0.5">
              Portão de garagem e Pedestre
            </span>
          </div>
        </button>

        <!-- Hamburger Button (mobile only) -->
        <button
          class="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a]"
          :aria-expanded="mobileMenuOpen"
          aria-label="Abrir menu de navegação"
          @click="toggleMobileMenu"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-gray-100 bg-white shadow-lg"
        aria-label="Menu mobile"
      >
        <div class="px-4 py-4 space-y-1">
          <NuxtLink
            to="/"
            class="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#09357a] transition-colors min-h-[48px]"
            active-class="!bg-blue-50 !text-[#09357a] !font-bold"
            @click="closeMobileMenu"
          >Home</NuxtLink>
          <NuxtLink
            to="/servicos"
            class="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#09357a] transition-colors min-h-[48px]"
            active-class="!bg-blue-50 !text-[#09357a] !font-bold"
            @click="closeMobileMenu"
          >Serviços</NuxtLink>
          <NuxtLink
            to="/sobre-nos"
            class="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#09357a] transition-colors min-h-[48px]"
            active-class="!bg-blue-50 !text-[#09357a] !font-bold"
            @click="closeMobileMenu"
          >Sobre Nós</NuxtLink>
          <NuxtLink
            to="/contato"
            class="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#09357a] transition-colors min-h-[48px]"
            active-class="!bg-blue-50 !text-[#09357a] !font-bold"
            @click="closeMobileMenu"
          >Contato</NuxtLink>

          <!-- Emergency button in mobile menu -->
          <div class="pt-2 border-t border-gray-100">
            <button
              @click="openEmergencyAndClose"
              class="w-full flex items-center justify-center space-x-2.5 px-4 py-3 rounded-xl bg-[#b91c1c] text-white transition-all active:scale-95 min-h-[48px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-current animate-pulse flex-shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div class="flex flex-col items-center justify-center text-center">
                <span class="text-sm font-bold uppercase tracking-wider leading-tight">Atendimento Emergencial</span>
                <span class="text-xs font-medium normal-case text-red-100 tracking-normal leading-tight mt-0.5">Portão de garagem e Pedestre</span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </Transition>
  </header>

  <!-- Overlay to close menu when tapping outside -->
  <Transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-150">
    <div
      v-if="mobileMenuOpen"
      class="md:hidden fixed inset-0 z-40 bg-black/20"
      @click="closeMobileMenu"
      aria-hidden="true"
    />
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import TopPhoneBar from '~/components/TopPhoneBar.vue'

const emit = defineEmits(['open-emergency'])

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const openEmergencyAndClose = () => {
  closeMobileMenu()
  emit('open-emergency')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && mobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>
