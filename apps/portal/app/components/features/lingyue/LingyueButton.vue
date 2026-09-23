<script setup lang="ts">
import { Button as AButton } from 'antdv-next'

defineProps<{ label?: string }>()
const { t } = useI18n()
const { state, enter } = useLingyue()
</script>

<template>
  <AButton :disabled="state.pending" @click="enter">{{ label || t('lingyue.enter') }}</AButton>
</template>
