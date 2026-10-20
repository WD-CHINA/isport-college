<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { normalizeNickname } from '@isport/shared'
import { useProfile } from '~/composables/useProfile'
import { useLoginUiStore } from '~/stores/login-ui'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const loginUi = useLoginUiStore()
const { t } = useI18n()
const { pending, error, save, skipNickname } = useProfile()
const nickname = shallowRef('')
const ready = computed(() => normalizeNickname(nickname.value) !== null)
const validationError = computed(() => {
  const value = nickname.value.trim()
  if (!value) return ''
  if (/\s/.test(value)) return t('academy.nicknameNoSpaces')
  if (/[^\u4e00-\u9fffA-Za-z0-9]/.test(value)) return t('academy.nicknameCharacters')
  return ready.value ? '' : t('academy.nicknameLength')
})

watch(
  () => loginUi.nicknameGuideVisible,
  visible => {
    if (visible) nickname.value = auth.user?.nickname ?? ''
  },
)

async function submit() {
  const value = normalizeNickname(nickname.value)
  if (value === null || !auth.user) return
  if (await save({ nickname: value })) {
    loginUi.nicknameGuideVisible = false
    messageApi.success(t('account.saved'))
  }
}

async function skip() {
  if (await skipNickname()) loginUi.nicknameGuideVisible = false
}

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => loginUi.nicknameGuideVisible && error.value,
  () => error.value,
)
</script>

<template>
  <ContextHolder />
  <AModal
    v-model:open="loginUi.nicknameGuideVisible"
    :title="t('academy.nicknameGuide')"
    :classes="{
      container: 'academy-login-container',
      header: 'academy-login-header academy-login-header--profile',
      body: 'academy-login-body',
    }"
    :width="480"
    :footer="null"
    centered
    destroy-on-hidden
    closable
  >
    <form v-if="auth.user" class="nickname-guide" @submit.prevent="submit">
      <p class="nickname-guide__hint">{{ t('academy.nicknameOptional') }}</p>
      <div class="nickname-guide__field">
        <label for="nickname-guide-name">{{ t('academy.nickname') }}</label>
        <AInput
          id="nickname-guide-name"
          v-model:value="nickname"
          :disabled="pending"
          :maxlength="6"
          :status="validationError ? 'error' : undefined"
          :aria-invalid="Boolean(validationError)"
          aria-describedby="nickname-guide-help"
          size="large"
          :placeholder="t('academy.nicknamePlaceholder')"
        />
        <p
          id="nickname-guide-help"
          class="nickname-guide__hint"
          :class="{ 'nickname-guide__hint--error': validationError }"
          :role="validationError ? 'alert' : undefined"
        >
          {{ validationError || t('academy.nicknameRule') }}
        </p>
      </div>
      <AButton
        type="primary"
        html-type="submit"
        size="large"
        :disabled="!ready"
        :loading="pending"
        block
      >
        {{ t('academy.saveNickname') }}
      </AButton>
      <button class="nickname-guide__skip" type="button" :disabled="pending" @click="skip">
        {{ t('academy.skip') }}
      </button>
    </form>
  </AModal>
</template>

<style lang="scss" scoped>
.nickname-guide {
  display: grid;
  gap: 24px;
  color: var(--ic-color-academy-text-primary);

  &__hint {
    margin: 0;
    color: var(--ic-color-academy-text-muted);
    font-size: 14px;
    line-height: 22px;

    &--error {
      color: #d93025;
    }
  }

  &__field {
    display: grid;
    gap: 10px;

    > label {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
    }

    :deep(.ant-input) {
      height: 40px;
      border-radius: 5px;
      font-size: 16px;
    }
  }

  > :deep(.ant-btn-primary) {
    height: 40px;
    border: 0;
    border-radius: 6px;
    background: var(--ic-color-academy-primary);
    box-shadow: none;
  }

  & > :deep(.ant-btn-primary:disabled),
  & > :deep(.ant-btn-primary.ant-btn-disabled) {
    border: 0;
    background: #e6e8ea;
    color: var(--ic-color-academy-text-disabled);
  }

  &__skip {
    justify-self: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ic-color-academy-primary);
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}
</style>
