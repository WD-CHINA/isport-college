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
const ready = computed(() => Boolean(normalizeNickname(nickname.value)))

watch(
  () => loginUi.nicknameGuideVisible,
  visible => {
    if (visible) nickname.value = auth.user?.nickname ?? ''
  },
)

async function submit() {
  const value = normalizeNickname(nickname.value)
  if (!value || !auth.user) return
  if (await save({ nickname: value, avatarCode: auth.user.avatarCode })) {
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
      <div class="nickname-guide__field">
        <label for="nickname-guide-name">{{ t('academy.nickname') }}</label>
        <AInput
          id="nickname-guide-name"
          v-model:value="nickname"
          :disabled="pending"
          :maxlength="6"
          size="large"
          :placeholder="t('academy.nicknamePlaceholder')"
        />
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
  color: #1c1f23;

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
    background: #0077fa;
    box-shadow: none;
  }

  & > :deep(.ant-btn-primary:disabled),
  & > :deep(.ant-btn-primary.ant-btn-disabled) {
    border: 0;
    background: #e6e8ea;
    color: rgb(28 31 35 / 35%);
  }

  &__skip {
    justify-self: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: #0077fa;
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
