<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { normalizeNickname, type WebProfile } from '@isport/shared'

const props = defineProps<{
  user: WebProfile
  pending: boolean
  error?: string
  confirm?: boolean
}>()
const emit = defineEmits<{ save: [value: { nickname: string }] }>()
const { t } = useI18n()
const formId = useId()
const nickname = shallowRef(props.user.nickname)
watch(
  () => props.user,
  user => {
    nickname.value = user.nickname
  },
)
function submit() {
  const value = normalizeNickname(nickname.value)
  if (value === null) {
    messageApi.error(t('academy.nicknameRule'))
    return
  }
  emit('save', { nickname: value })
}

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => props.error,
  () => props.error ?? '',
)
</script>

<template>
  <form class="profile-form" @submit.prevent="submit">
    <ContextHolder />
    <label :for="`${formId}-nickname`">{{ t('academy.nickname') }}</label>
    <AInput
      :id="`${formId}-nickname`"
      v-model:value="nickname"
      :disabled="pending"
      :maxlength="20"
    />
    <p>{{ t('academy.nicknameRule') }}</p>
    <AButton html-type="submit" type="primary" :loading="pending">{{
      t(confirm ? 'common.confirm' : 'common.save')
    }}</AButton>
  </form>
</template>

<style lang="scss" scoped>
.profile-form {
  display: grid;
  gap: var(--ic-spacing-3, 12px);
}
</style>
