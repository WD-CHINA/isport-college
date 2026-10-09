<script setup lang="ts">
import { AVATAR_IDS } from '@isport/shared'

const props = defineProps<{ avatarCode: number }>()
const { t } = useI18n()
const symbols = ['◉', '➜', '≈', '◎', '◈', '★', '▲', '☀']
const avatarId = computed(() => AVATAR_IDS[props.avatarCode - 1] ?? AVATAR_IDS[0])
const symbol = computed(() => symbols[props.avatarCode - 1] ?? '●')
</script>

<template>
  <span class="account-avatar" role="img" :aria-label="t(`academy.avatars.${avatarId}`)">{{
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
  background: var(--ic-color-brand-100);
  font-size: 22px;
}
</style>
