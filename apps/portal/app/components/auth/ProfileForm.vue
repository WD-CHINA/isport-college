<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { normalizeNickname, type WebProfile } from '@isport/shared'

const props = defineProps<{
  user: WebProfile
  pending: boolean
  error?: string
  confirm?: boolean
  inline?: boolean
}>()
const emit = defineEmits<{ save: [value: { nickname: string }] }>()
defineSlots<{ actions?: () => unknown }>()
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
  <form class="profile-form" :class="{ 'profile-form--inline': inline }" @submit.prevent="submit">
    <ContextHolder />
    <label :for="`${formId}-nickname`">{{ t('academy.nickname') }}</label>
    <AInput
      :id="`${formId}-nickname`"
      v-model:value="nickname"
      :disabled="pending"
      :maxlength="6"
      :show-count="inline"
    />
    <p>{{ t('academy.nicknameRule') }}</p>
    <div class="profile-form__actions">
      <AButton html-type="submit" type="primary" :loading="pending">{{
        t(confirm ? 'common.confirm' : 'common.save')
      }}</AButton>
      <slot name="actions" />
    </div>
  </form>
</template>

<style lang="scss" scoped>
.profile-form {
  display: grid;
  gap: var(--ic-spacing-3, 12px);

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--ic-spacing-3, 12px);
  }

  &--inline {
    flex: 1;
    min-width: 0;
    max-width: 496px;
    grid-template-columns: minmax(0, 320px) auto;
    gap: 4px 12px;

    > label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    > :deep(.ant-input-affix-wrapper) {
      grid-area: 1 / 1;
      height: 44px;
      border-radius: 6px;
    }

    > p {
      grid-area: 2 / 1 / 3 / -1;
      margin: 0;
      color: var(--ic-color-academy-text-caption);
      font-size: 10px;
      line-height: 17px;
    }

    .profile-form__actions {
      grid-area: 1 / 2;
      gap: 12px;
    }

    :deep(.ant-btn) {
      width: 76px;
      height: 40px;
      padding-inline: 0;
      border: 0;
      border-radius: 6px;
      box-shadow: none;
    }

    :deep(.ant-btn-primary) {
      background: var(--ic-color-academy-primary);
    }

    :deep(.ant-btn-default) {
      background: var(--ic-color-academy-tint);
      color: var(--ic-color-academy-primary);
    }
  }
}

@media (max-width: 767px) {
  .profile-form--inline {
    flex-basis: 100%;
    grid-template-columns: minmax(0, 1fr);

    .profile-form__actions {
      grid-area: 3 / 1;
    }
  }
}
</style>
