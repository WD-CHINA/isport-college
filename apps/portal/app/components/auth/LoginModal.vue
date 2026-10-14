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
  padding: 0 32px 40px !important;
  border-radius: 16px !important;
  background:
    linear-gradient(180deg, rgb(0 119 250 / 25%), rgb(0 119 250 / 0%) 155px), #fff !important;
}

.academy-login-header {
  display: flex;
  height: 144px;
  align-items: center;
  margin-bottom: 0 !important;
  padding-bottom: 6px;
  background: url('/auth/ardot/login-school.svg') right -7px top 24px / 212px 124px no-repeat !important;
}

.academy-login-header .ant-modal-title {
  position: relative;
  font-size: 24px;
  font-weight: 600;
  line-height: 34px;
}

.academy-login-body {
  padding: 0 !important;
}

@media (max-width: 480px) {
  .academy-login-container {
    padding-inline: 20px !important;
  }

  .academy-login-header {
    background-position: right -65px top 24px !important;
  }

  .academy-login-header .ant-modal-title {
    max-width: 240px;
    font-size: 21px;
  }
}
</style>
