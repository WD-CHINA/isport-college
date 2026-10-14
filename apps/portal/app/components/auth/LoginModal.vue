<script setup lang="ts">
import SmsLoginForm from '~/components/auth/SmsLoginForm.vue'
import { useSmsLogin } from '~/composables/auth/useSmsLogin'
import { useLoginUiStore } from '~/stores/login-ui'

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
    :title="t('auth.designWelcome')"
    :classes="{
      container: 'academy-login-container',
      header: 'academy-login-header',
      body: 'academy-login-body',
    }"
    :width="480"
    :footer="null"
    centered
    destroy-on-hidden
    closable
  >
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

<style>
.academy-login-container {
  overflow: hidden;
  padding: 12px 0 40px !important;
  border-radius: 16px !important;
  background:
    linear-gradient(180deg, rgb(0 119 250 / 25%), rgb(0 119 250 / 0%) 148px), #fff !important;
}

.academy-login-container .ant-modal-close {
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  color: #1c1f23;
}

.academy-login-header {
  display: flex;
  height: 136px;
  align-items: center;
  margin-bottom: 0 !important;
  padding: 0 72px 0 32px;
  background: url('/auth/ardot/login-header.png') right center / 480px 136px no-repeat !important;
}

.academy-login-header--profile {
  background-image: url('/auth/ardot/nickname-header.png') !important;
}

.academy-login-header .ant-modal-title {
  position: relative;
  color: #1c1f23;
  font-size: 24px;
  font-weight: 600;
  line-height: 34px;
}

.academy-login-body {
  padding: 0 32px !important;
}

@media (max-width: 480px) {
  .academy-login-body {
    padding-inline: 20px !important;
  }

  .academy-login-header {
    padding-left: 20px;
    background-position: right -40px center !important;
  }

  .academy-login-header .ant-modal-title {
    max-width: 180px;
    font-size: 21px;
  }
}
</style>
