<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { useAccountActivity } from '../composables/useAccountActivity'
import AccountProfile from './AccountProfile.vue'
import ActivityFilters from './ActivityFilters.vue'
import ActivityList from './ActivityList.vue'
import AppPagination from '~/components/app/AppPagination.vue'

const { t } = useI18n()
const [messageApi, ContextHolder] = message.useMessage()
const { kind, channel, page, removing, failed, totals, items, total, request, filter, remove } =
  useAccountActivity({
    onRemoved: kind =>
      messageApi.success(t(kind === 'like' ? 'detail.unlikeSuccess' : 'detail.unfavoriteSuccess')),
  })
const { error, status, refresh } = request
useSeoMeta({ title: () => t('academy.account') })
useMessageFeedback(messageApi, failed, () => t('detail.interactionFailed'))
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request
</script>

<template>
  <main class="account-feature ic-container">
    <ContextHolder />
    <h1>{{ t('academy.account') }}</h1>
    <AccountProfile />
    <section class="account-feature__activity">
      <ActivityFilters
        :kind="kind"
        :channel="channel"
        :totals="totals"
        :disabled="Boolean(removing)"
        @change="filter"
      />
      <AButton v-if="error" @click="refresh()">{{ t('catalog.retry') }}</AButton>
      <template v-else>
        <ActivityList
          :items="items"
          :kind="kind"
          :channel="channel"
          :loading="status === 'pending'"
          :removing="removing"
          @remove="remove"
        />
        <AppPagination :total="total" :page="page" :page-size="12" @change="page = $event" />
      </template>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.account-feature {
  padding-top: 32px;
  padding-bottom: 56px;

  :deep(h1) {
    margin: 0 0 20px;
    font-size: var(--ic-font-size-3xl, 30px);
    letter-spacing: -0.01em;
  }

  &__activity {
    margin-top: 32px;
  }
}
</style>
