<script setup lang="ts">
import { AVATAR_IDS, normalizeNickname } from '@isport/shared'
import type { AcademyUser } from '@isport/shared'
import { Alert as AAlert, Button as AButton, Input as AInput } from 'antdv-next'

const props = defineProps<{ user: AcademyUser; pending: boolean; error?: string }>()
const emit = defineEmits<{ save: [value: { nickname: string; avatar: string }] }>()
const { t } = useI18n()
const formId = useId()
const nickname = ref(props.user.name)
const avatar = ref(props.user.avatar)
const invalid = ref(false)
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
watch(
  () => props.user,
  user => {
    nickname.value = user.name
    avatar.value = user.avatar
  },
)
function submit() {
  const value = normalizeNickname(nickname.value)
  invalid.value = value === null
  if (value !== null) emit('save', { nickname: value, avatar: avatar.value })
}
</script>

<template>
  <form class="profile-form" @submit.prevent="submit">
    <AAlert
      v-if="error || invalid"
      type="error"
      :title="invalid ? t('academy.nicknameRule') : error"
      show-icon
    />
    <label :for="`${formId}-nickname`">{{ t('academy.nickname') }}</label>
    <AInput
      :id="`${formId}-nickname`"
      v-model:value="nickname"
      :disabled="pending"
      :maxlength="20"
    />
    <p>{{ t('academy.nicknameRule') }}</p>
    <fieldset :disabled="pending" class="profile-form__avatars">
      <legend>{{ t('academy.avatar') }}</legend>
      <label v-for="id in AVATAR_IDS" :key="id" class="profile-form__avatar">
        <input
          v-model="avatar"
          type="radio"
          :name="`${formId}-avatar`"
          :value="id"
          :aria-label="t(`academy.avatars.${id}`)"
        />
        <span aria-hidden="true">{{ symbols[id] || '●' }}</span>
      </label>
    </fieldset>
    <AButton html-type="submit" type="primary" :loading="pending">{{ t('common.save') }}</AButton>
  </form>
</template>

<style scoped>
.profile-form {
  display: grid;
  gap: var(--ic-spacing-3, 12px);
}

.profile-form__avatars {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-3, 12px);
  border: 0;
  padding: 0;
}

.profile-form__avatar {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: var(--ic-spacing-1, 4px);
  font-size: 24px;
}
</style>
