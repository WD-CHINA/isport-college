<script setup lang="ts">
import { Modal as AModal } from 'antdv-next'

const auth = useAuthStore()
const { t } = useI18n()
const { form, challenge, sending, submitting, error, remaining, send, submit } = useSmsLogin()
const visible = computed({
  get: () => auth.loginModalVisible,
  set: value => {
    if (!value) auth.closeLoginModal()
  },
})
</script>

<template>
  <AModal
    v-model:open="visible"
    :title="t('auth.loginTitle')"
    :width="440"
    :footer="null"
    centered
    destroy-on-hidden
  >
    <p class="login-subtitle">{{ t('auth.gateDefault') }}</p>
    <SmsLoginForm
      v-model:phone="form.phone"
      v-model:code="form.code"
      v-model:agreed="form.agreed"
      :sending="sending"
      :submitting="submitting"
      :error="error"
      :remaining="remaining"
      :demo-code="challenge?.demoCode"
      @send="send"
      @submit="submit"
    />
  </AModal>
</template>

<style scoped>
.login-subtitle {
  margin-bottom: var(--ic-spacing-4, 16px);
  color: var(--ic-color-text-secondary, #475569);
}
</style>
