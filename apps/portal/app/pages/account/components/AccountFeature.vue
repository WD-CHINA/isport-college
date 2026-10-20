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
const {
  kind,
  channel,
  page,
  pageSize,
  removing,
  failed,
  totals,
  items,
  total,
  request,
  filter,
  remove,
} = useAccountActivity({
  onRemoved: kind =>
    messageApi.success(t(kind === 'like' ? 'detail.unlikeSuccess' : 'detail.unfavoriteSuccess')),
})
const { error, status, refresh } = request
const activityStart = useTemplateRef<HTMLElement>('activityStart')
watch(page, async () => {
  await nextTick()
  activityStart.value?.scrollIntoView({ block: 'start' })
})
useSeoMeta({ title: () => t('academy.account') })
useMessageFeedback(messageApi, failed, () => t('detail.interactionFailed'))
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request
</script>

<template>
  <div class="account-feature container-page">
    <ContextHolder />
    <h1 class="account-feature__title">{{ t('academy.account') }}</h1>
    <AccountProfile />
    <section ref="activityStart" class="account-feature__activity">
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
        <AppPagination
          :total="total"
          :page="page"
          :page-size="pageSize"
          :hide-on-single-page="false"
          variant="catalog"
          @change="page = $event"
        />
      </template>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.account-feature {
  padding-top: 40px;
  padding-bottom: 56px;

  &__title {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  &__activity {
    scroll-margin-top: 90px;
    margin-top: 24px;
    padding: 24px 24px 0;
    border: 1px solid var(--ic-color-academy-border-panel);
    border-radius: 12px;
    background: var(--ic-color-background-container);
  }
}

@media (max-width: 767px) {
  .account-feature {
    padding-top: 24px;
    padding-bottom: 32px;

    &__activity {
      padding: 16px 16px 0;
    }
  }
}
</style>
