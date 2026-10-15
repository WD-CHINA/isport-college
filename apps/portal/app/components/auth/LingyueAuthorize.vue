<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { useLingyueLaunch } from '~/composables/useLingyueLaunch'

const { t } = useI18n()
const { authorizeOpen, pending, error, confirmAuthorize, cancelAuthorize } = useLingyueLaunch()
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => error.value,
  () => error.value,
)
</script>

<template>
  <ContextHolder />
  <AModal
    v-model:open="authorizeOpen"
    :title="t('lingyue.enter')"
    :ok-text="t('lingyue.authorizeAction')"
    :cancel-text="t('common.cancel')"
    :confirm-loading="pending"
    centered
    @ok="confirmAuthorize"
    @cancel="cancelAuthorize"
  >
    <p>{{ t('lingyue.authorize') }}</p>
  </AModal>
</template>
