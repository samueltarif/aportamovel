<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAnalytics } from '~/composables/useAnalytics'

const { trackQuoteFormStarted, trackQuoteFormSubmitted, trackWhatsAppClick } = useAnalytics()

const form = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
})

const submitted = ref(false)
const isSubmitting = ref(false)

const handleFieldFocus = () => {
  trackQuoteFormStarted({
    form_id: 'contact_form',
    form_location: 'contact_page',
  })
}

const handleSubmit = () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  submitted.value = true

  // Disparar os dois eventos exigidos pela regra #3
  trackQuoteFormSubmitted({
    form_id: 'contact_form',
    form_location: 'contact_page',
    submission_destination: 'whatsapp',
  })

  trackWhatsAppClick({
    cta_location: 'contact_form',
    channel_type: 'commercial',
  })

  const messageText = `*Solicitação de Orçamento via Site - A Portamóvel*\n\n`
    + `👤 *Nome:* ${form.name}\n`
    + `🏢 *Condomínio / Empresa:* ${form.company || 'Não informado'}\n`
    + `✉️ *E-mail:* ${form.email}\n`
    + `📱 *Telefone / WhatsApp:* ${form.phone}\n\n`
    + `📝 *Mensagem / Escopo Técnico:*\n${form.message || 'Sem descrição adicional'}`

  window.open(`https://wa.me/5511912984416?text=${encodeURIComponent(messageText)}`, '_blank')

  setTimeout(() => {
    isSubmitting.value = false
  }, 1000)
}
</script>

<template>
  <div class="bg-blue-50/70 border border-blue-100/90 rounded-2xl p-5 sm:p-8 shadow-sm">
    <div class="flex items-center space-x-3 mb-5 sm:mb-6 text-[#09357a]">
      <svg class="w-5 h-5 sm:w-6 sm:h-6 fill-current text-emerald-600 flex-shrink-0" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
      </svg>
      <h2 class="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
        Solicite um Orçamento via WhatsApp
      </h2>
    </div>

    <form class="space-y-4 sm:space-y-5" @submit.prevent="handleSubmit">
      <!-- Row 1: Name and Condo — stacked on mobile -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase text-gray-700 mb-1.5" for="cf-name">Nome Completo</label>
          <input
            id="cf-name"
            v-model="form.name"
            type="text"
            required
            autocomplete="name"
            placeholder="João da Silva"
            class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            @focus="handleFieldFocus"
          >
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-gray-700 mb-1.5" for="cf-company">Condomínio / Empresa</label>
          <input
            id="cf-company"
            v-model="form.company"
            type="text"
            autocomplete="organization"
            placeholder="Condomínio Alpha"
            class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            @focus="handleFieldFocus"
          >
        </div>
      </div>

      <!-- Row 2: Email and Phone — stacked on mobile -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase text-gray-700 mb-1.5" for="cf-email">E-mail Profissional</label>
          <input
            id="cf-email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            placeholder="joao@exemplo.com"
            class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            @focus="handleFieldFocus"
          >
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-gray-700 mb-1.5" for="cf-phone">Telefone / WhatsApp</label>
          <input
            id="cf-phone"
            v-model="form.phone"
            type="tel"
            required
            autocomplete="tel"
            placeholder="(11) 99999-9999"
            class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            @focus="handleFieldFocus"
          >
        </div>
      </div>

      <!-- Row 3: Message -->
      <div>
        <label class="block text-xs font-bold uppercase text-gray-700 mb-1.5" for="cf-message">Mensagem / Escopo Técnico</label>
        <textarea
          id="cf-message"
          v-model="form.message"
          rows="4"
          placeholder="Descreva sua necessidade estrutural ou de segurança..."
          class="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
          @focus="handleFieldFocus"
        />
      </div>

      <!-- Submit Button: full width on mobile -->
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 min-h-[52px] disabled:opacity-50"
      >
        <svg class="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
        <span>ENVIAR SOLICITAÇÃO VIA WHATSAPP</span>
      </button>

      <div v-if="submitted" class="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold text-center">
        ✓ Redirecionando para o WhatsApp com os dados preenchidos...
      </div>
    </form>
  </div>
</template>
