<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      @click.self="$emit('close')"
      role="dialog"
      aria-modal="true"
      aria-label="Modal de orçamento"
    >
      <div
        class="bg-white w-full sm:w-[calc(100%-2rem)] sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl border border-blue-100 relative max-h-[90dvh] overflow-y-auto"
      >
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          class="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          aria-label="Fechar modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header -->
        <div class="mb-5 sm:mb-6 pr-8">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            Orçamento Rápido
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-[#09357a] mt-2 leading-tight">
            {{ serviceName ? `Solicitar: ${serviceName}` : 'Solicite um Orçamento' }}
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            Preencha seus dados para receber nosso atendimento técnico especializado.
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-700 mb-1" for="modal-name">Nome Completo</label>
            <input
              id="modal-name"
              v-model="form.name"
              type="text"
              required
              autocomplete="name"
              placeholder="Ex: João da Silva"
              class="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#09357a] focus:border-[#09357a] outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-700 mb-1" for="modal-phone">Telefone / WhatsApp</label>
            <input
              id="modal-phone"
              v-model="form.phone"
              type="tel"
              required
              autocomplete="tel"
              placeholder="(11) 99999-9999"
              class="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#09357a] focus:border-[#09357a] outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-700 mb-1" for="modal-condo">Condomínio / Empresa</label>
            <input
              id="modal-condo"
              v-model="form.condo"
              type="text"
              autocomplete="organization"
              placeholder="Ex: Condomínio Alpha"
              class="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#09357a] focus:border-[#09357a] outline-none"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3.5 bg-[#09357a] text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#07285c] transition-all shadow-md mt-2 flex items-center justify-center space-x-2 min-h-[52px]"
          >
            <span>Enviar via WhatsApp</span>
            <svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  serviceName?: string
}>()

const emit = defineEmits(['close'])

const form = reactive({
  name: '',
  phone: '',
  condo: ''
})

// Lock/unlock body scroll
watch(() => props.isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

const handleSubmit = () => {
  const text = `Olá, meu nome é ${form.name}. Gostaria de solicitar um orçamento para *${props.serviceName || 'Serviços'}* para o *${form.condo || 'meu condomínio'}*. Contato: ${form.phone}`
  window.open(`https://wa.me/5511912984416?text=${encodeURIComponent(text)}`, '_blank')
  emit('close')
}
</script>
