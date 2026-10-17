import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CONTACT, getShift, type Shift } from '~/utils/contactNumbers'

/**
 * Canal de contato ativo (comercial × plantão).
 * No SSR começa em "day" (HTML estático estável) e corrige no cliente logo após a montagem,
 * evitando divergência de hidratação.
 */
export function useContactShift() {
  const shift = ref<Shift>('day')
  let timer: ReturnType<typeof setInterval> | null = null

  const update = () => {
    shift.value = getShift()
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 60_000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const contact = computed(() => CONTACT[shift.value])
  const isPlantao = computed(() => shift.value === 'plantao')

  return { shift, contact, isPlantao }
}
