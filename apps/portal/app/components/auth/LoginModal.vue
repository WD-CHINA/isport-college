<script setup lang="ts">
import SmsLoginForm from '~/components/auth/SmsLoginForm.vue'
import { useSmsLogin } from '~/composables/auth/useSmsLogin'
import { useLoginUiStore } from '~/stores/login-ui'
import { Modal as AModal } from 'antdv-next'

const loginUi = useLoginUiStore()
const { t } = useI18n()
const { form, sending, submitting, error, remaining, send, submit } = useSmsLogin()
const visible = computed({
  get: () => loginUi.loginModalVisible,
  set: value => {
    if (!value) loginUi.closeLoginModal()
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
