<script setup lang="ts">
const props = defineProps<{ avatar: string }>()
const { t } = useI18n()
const symbols: Record<string, string> = {
  ball: '◉',
  star: '★',
  sun: '☀',
  mountain: '▲',
  runner: '➜',
  swimmer: '≈',
  cyclist: '◎',
  racket: '◈',
}
const symbol = computed(() => symbols[props.avatar] ?? '●')
</script>

<template>
  <span class="account-avatar" role="img" :aria-label="t(`academy.avatars.${avatar}`)">{{
    symbol
  }}</span>
</template>

<style scoped>
.account-avatar {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 50%;
  color: #1d4e7b;
  background: #dbeafe;
  font-size: 22px;
}
</style>
