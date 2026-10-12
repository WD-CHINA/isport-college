<script setup lang="ts">
import { useSessionActions } from '~/composables/auth/useSessionActions'
import { useLoginUiStore } from '~/stores/login-ui'
import { App } from 'antdv-next'
const loginUi = useLoginUiStore()
const { logout } = useSessionActions()
const { t } = useI18n()
const localePath = useLocalePath()
const { message } = App.useApp()
const pending = ref(false)
async function confirm() {
  if (pending.value) return
  pending.value = true
  try {
    await logout()
  } catch {
    message.warning(t('academy.logoutLocal'))
  } finally {
    pending.value = false
    await navigateTo(localePath('/'))
  }
}
</script>

<template>
  <AModal
    v-model:open="loginUi.logoutConfirmVisible"
    :title="t('common.logout')"
    :confirm-loading="pending"
    :ok-text="t('common.confirm')"
    :cancel-text="t('common.cancel')"
    centered
    @ok="confirm"
  >
    <p>{{ t('academy.logoutConfirm') }}</p>
  </AModal>
</template>
