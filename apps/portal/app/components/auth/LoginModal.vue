<script setup lang="ts">
import { isValidCnMobile, normalizePhone } from '@isport/shared'
import { App, useBreakpoint } from 'antdv-next'

const auth = useAuthStore()
const { message } = App.useApp()
const { t } = useI18n()
const screens = useBreakpoint()

const form = reactive({ phone: '', password: '' })
const errors = reactive<{ phone?: string; password?: string }>({})
const submitting = shallowRef(false)
const failed = shallowRef(false)

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

function validate(): boolean {
  errors.phone = !form.phone.trim()
    ? t('auth.phoneRequired')
    : !isValidCnMobile(form.phone)
      ? t('auth.phoneInvalid')
      : undefined
  errors.password = !form.password ? t('auth.passwordRequired') : undefined
  return !errors.phone && !errors.password
}

async function submit() {
  failed.value = false
  if (!validate()) return

  submitting.value = true
  try {
    await auth.login({ phone: normalizePhone(form.phone), password: form.password })
    message.success(t('auth.success'))
    form.password = ''
    await auth.resolveLoginSuccess()
  } catch {
    failed.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <a-modal
    v-model:open="visible"
    :title="t('auth.loginTitle')"
    :width="modalWidth"
    :footer="null"
    centered
    destroy-on-close
  >
    <p class="login-modal__subtitle">{{ reasonText }} · {{ t('auth.loginSubtitle') }}</p>

    <a-alert class="login-modal__tip" type="info" :message="t('auth.demoTip')" show-icon />
    <a-alert
      v-if="failed"
      class="login-modal__tip"
      type="error"
      :message="t('auth.failed')"
      show-icon
    />

    <form class="login-modal__form" novalidate @submit.prevent="submit">
      <div class="login-modal__field">
        <label class="login-modal__label" for="login-phone">{{ t('auth.phone') }}</label>
        <a-input
          id="login-phone"
          v-model:value="form.phone"
          size="large"
          inputmode="tel"
          autocomplete="tel"
          :placeholder="t('auth.phonePlaceholder')"
          :status="errors.phone ? 'error' : ''"
        />
        <p v-if="errors.phone" class="login-modal__error">{{ errors.phone }}</p>
      </div>

      <div class="login-modal__field">
        <label class="login-modal__label" for="login-password">{{ t('auth.password') }}</label>
        <a-input-password
          id="login-password"
          v-model:value="form.password"
          size="large"
          autocomplete="current-password"
          :placeholder="t('auth.passwordPlaceholder')"
          :status="errors.password ? 'error' : ''"
        />
        <p v-if="errors.password" class="login-modal__error">{{ errors.password }}</p>
      </div>

      <a-button type="primary" size="large" block html-type="submit" :loading="submitting">
        {{ t('auth.submit') }}
      </a-button>
    </form>
  </a-modal>
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
</style>
