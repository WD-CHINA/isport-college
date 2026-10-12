<script setup lang="ts">
import { useAcademy } from '~/composables/useAcademy'
import { AVATAR_IDS, normalizeNickname, type WebProfile } from '@isport/shared'

const props = defineProps<{ user: WebProfile; pending: boolean; error?: string }>()
const emit = defineEmits<{ save: [value: { nickname: string; avatarCode: number }] }>()
const academy = useAcademy()
const { t } = useI18n()
const formId = useId()
const nickname = shallowRef(props.user.nickname)
const avatarCode = shallowRef(props.user.avatarCode)
const invalid = shallowRef(false)
const avatarRequest = useAsyncData('academy:avatars', () => academy.avatars())
const codes = computed(() =>
  avatarRequest.data.value?.length
    ? avatarRequest.data.value
    : AVATAR_IDS.map((_, index) => index + 1),
)
const symbols = ['◉', '➜', '≈', '◎', '◈', '★', '▲', '☀']
watch(
  () => props.user,
  user => {
    nickname.value = user.nickname
    avatarCode.value = user.avatarCode
  },
)
function submit() {
  const value = normalizeNickname(nickname.value)
  invalid.value = value === null
  if (value !== null) emit('save', { nickname: value, avatarCode: avatarCode.value })
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
      <label v-for="code in codes" :key="code" class="profile-form__avatar">
        <input
          v-model="avatarCode"
          type="radio"
          :name="`${formId}-avatar`"
          :value="code"
          :aria-label="t(`academy.avatars.${AVATAR_IDS[code - 1] ?? 'ball'}`)"
        />
        <span aria-hidden="true">{{ symbols[code - 1] || '●' }}</span>
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
