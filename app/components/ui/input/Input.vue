<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  autocomplete?: string
  required?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const modelValue = useVModel(props, 'modelValue', emit)
</script>

<template>
  <input
    v-bind="$attrs"
    :id="id"
    v-model="modelValue"
    data-slot="input"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :required="required"
    :class="cn(
      'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-gray-400',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09357a] focus-visible:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  />
</template>
