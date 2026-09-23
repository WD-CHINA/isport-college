<script setup lang="ts">
import { App, Modal as AModal } from 'antdv-next'
const auth = useAuthStore()
const { t } = useI18n()
const localePath = useLocalePath()
const { message } = App.useApp()
const pending = ref(false)
async function confirm() {
  if (pending.value) return
  pending.value = true
  try {
    await auth.logout()
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
    v-model:open="auth.logoutConfirmVisible"
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
