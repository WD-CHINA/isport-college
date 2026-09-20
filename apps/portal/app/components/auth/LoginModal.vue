<script setup lang="ts">
import { isApiError } from '@isport/api-client'
import type { CaptchaChallenge } from '~/api/auth'
import { fetchCaptcha } from '~/api/auth'
import {
  Alert as AAlert,
  App,
  Button as AButton,
  Input as AInput,
  InputPassword as AInputPassword,
  Modal as AModal,
  useBreakpoint,
} from 'antdv-next'

const auth = useAuthStore()
const { message } = App.useApp()
const { t } = useI18n()
const screens = useBreakpoint()

const form = reactive({ username: '', password: '', captcha: '' })
const errors = reactive<{ username?: string; password?: string; captcha?: string }>({})
const submitting = shallowRef(false)
const failed = shallowRef(false)
const failureMessage = shallowRef('')
const challenge = shallowRef<CaptchaChallenge | null>(null)

/** PC 端居中弹窗；移动端接近全屏的响应式宽度 */
const modalWidth = computed(() => (screens.value?.sm ? 420 : 'calc(100vw - 32px)'))

const visible = computed({
  get: () => auth.loginModalVisible,
  set: value => {
    if (!value) auth.closeLoginModal()
  },
})

const reasonText = computed(() => {
  switch (auth.loginIntent?.reason) {
    case 'enroll':
      return t('auth.gateEnroll')
    case 'admin':
      return t('auth.gateAdmin')
    default:
      return t('auth.gateDefault')
  }
})

/** 图形验证码：ckey 一次性，弹窗打开与登录失败后都需刷新（不清空已输入的验证码，避免异步竞态擦除用户输入） */
async function refreshCaptcha() {
  try {
    challenge.value = await fetchCaptcha()
  } catch {
    challenge.value = null
  }
}

watch(visible, open => {
  if (open) {
    failed.value = false
    failureMessage.value = ''
    void refreshCaptcha()
  }
})

function validate(): boolean {
  errors.username = !form.username.trim() ? t('auth.usernameRequired') : undefined
  errors.password = !form.password ? t('auth.passwordRequired') : undefined
  errors.captcha = !form.captcha.trim() ? t('auth.captchaRequired') : undefined
  return !errors.username && !errors.password && !errors.captcha
}

async function submit() {
  failed.value = false
  failureMessage.value = ''
  if (!validate()) return
  if (!challenge.value) {
    await refreshCaptcha()
    if (!challenge.value) {
      failed.value = true
      failureMessage.value = t('auth.captchaUnavailable')
      return
    }
  }

  submitting.value = true
  try {
    await auth.login({
      username: form.username.trim(),
      password: form.password,
      captcha: form.captcha.trim(),
      ckey: challenge.value!.ckey,
    })
    message.success(t('auth.success'))
    form.password = ''
    await auth.resolveLoginSuccess()
  } catch (error) {
    failed.value = true
    failureMessage.value = isApiError(error) ? error.message : t('auth.failed')
    // 验证码错误后 ckey 已失效，换一张
    await refreshCaptcha()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AModal
    v-model:open="visible"
    :title="t('auth.loginTitle')"
    :width="modalWidth"
    :footer="null"
    centered
    destroy-on-hidden
  >
    <p class="login-modal__subtitle">{{ reasonText }} · {{ t('auth.loginSubtitle') }}</p>

    <AAlert
      v-if="failed"
      class="login-modal__tip"
      type="error"
      :message="failureMessage || t('auth.failed')"
      show-icon
    />

    <form class="login-modal__form" novalidate @submit.prevent="submit">
      <div class="login-modal__field">
        <label class="login-modal__label" for="login-username">{{ t('auth.username') }}</label>
        <AInput
          id="login-username"
          v-model:value="form.username"
          size="large"
          autocomplete="username"
          :placeholder="t('auth.usernamePlaceholder')"
          :status="errors.username ? 'error' : ''"
        />
        <p v-if="errors.username" class="login-modal__error">{{ errors.username }}</p>
      </div>

      <div class="login-modal__field">
        <label class="login-modal__label" for="login-password">{{ t('auth.password') }}</label>
        <AInputPassword
          id="login-password"
          v-model:value="form.password"
          size="large"
          autocomplete="current-password"
          :placeholder="t('auth.passwordPlaceholder')"
          :status="errors.password ? 'error' : ''"
        />
        <p v-if="errors.password" class="login-modal__error">{{ errors.password }}</p>
      </div>

      <div class="login-modal__field">
        <label class="login-modal__label" for="login-captcha">{{ t('auth.captcha') }}</label>
        <div class="login-modal__captcha-row">
          <AInput
            id="login-captcha"
            v-model:value="form.captcha"
            size="large"
            :maxlength="6"
            autocomplete="one-time-code"
            :placeholder="t('auth.captchaPlaceholder')"
            :status="errors.captcha ? 'error' : ''"
          />
          <button
            class="login-modal__captcha"
            type="button"
            :aria-label="t('auth.captchaRefresh')"
            :disabled="!challenge"
            @click="refreshCaptcha"
          >
            <img
              v-if="challenge"
              class="login-modal__captcha-img"
              :src="challenge.base64Img"
              :alt="t('auth.captcha')"
            />
            <span v-else class="login-modal__captcha-placeholder">{{
              t('auth.captchaRefresh')
            }}</span>
          </button>
        </div>
        <p v-if="errors.captcha" class="login-modal__error">{{ errors.captcha }}</p>
      </div>

      <AButton type="primary" size="large" block html-type="submit" :loading="submitting">
        {{ t('auth.submit') }}
      </AButton>
    </form>
  </AModal>
</template>

<style scoped>
.login-modal__subtitle {
  margin: 0 0 var(--ic-spacing-3, 12px);
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}

.login-modal__tip {
  margin-bottom: var(--ic-spacing-3, 12px);
}

.login-modal__form {
  display: flex;
  flex-direction: column;
  gap: var(--ic-spacing-4, 16px);
  margin-top: var(--ic-spacing-2, 8px);
}

.login-modal__field {
  display: flex;
  flex-direction: column;
  gap: var(--ic-spacing-1, 4px);
}

.login-modal__label {
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-medium, 500);
}

.login-modal__error {
  font-size: var(--ic-font-size-xs, 12px);
  color: var(--ic-color-semantic-error, #dc2626);
}

.login-modal__captcha-row {
  display: flex;
  align-items: stretch;
  gap: var(--ic-spacing-2, 8px);
}

.login-modal__captcha-row :deep(.ant-input-affix-wrapper),
.login-modal__captcha-row :deep(.ant-input) {
  flex: 1;
  min-width: 0;
}

.login-modal__captcha {
  flex-shrink: 0;
  width: 96px;
  padding: 0;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-md, 8px);
  background: var(--ic-color-background-layout, #f8fafc);
  cursor: pointer;
  overflow: hidden;
}

.login-modal__captcha:disabled {
  cursor: default;
  opacity: 0.6;
}

.login-modal__captcha-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-modal__captcha-placeholder {
  font-size: var(--ic-font-size-xs, 12px);
  color: var(--ic-color-text-secondary, #475569);
}
</style>
