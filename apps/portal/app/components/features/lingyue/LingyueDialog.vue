<script setup lang="ts">
import { Alert as AAlert, Button as AButton, Modal as AModal } from 'antdv-next'

const { t } = useI18n()
const auth = useAuthStore()
const { state, enter, authorize, cancel } = useLingyue()
watch(() => auth.session?.token, cancel)
</script>

<template>
  <AModal :open="state.open" :title="t('lingyue.title')" :footer="null" @cancel="cancel">
    <p>{{ t('lingyue.notice') }}</p>
    <p v-if="state.pending" role="status">{{ t('common.loading') }}</p>
    <p v-else-if="state.authorize">{{ t('lingyue.authorize') }}</p>
    <AAlert v-if="state.failed" type="error" :title="t('academy.requestFailed')" />
    <div class="lingyue-dialog-actions">
      <AButton @click="cancel">{{ t('common.cancel') }}</AButton>
      <AButton v-if="state.authorize" type="primary" :loading="state.pending" @click="authorize">{{
        t('lingyue.authorizeAction')
      }}</AButton>
      <AButton v-else-if="state.failed" type="primary" @click="enter">{{
        t('catalog.retry')
      }}</AButton>
    </div>
  </AModal>
</template>

<style scoped>
.lingyue-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
