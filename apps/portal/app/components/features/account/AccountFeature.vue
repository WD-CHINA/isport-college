<script setup lang="ts">
import { Alert as AAlert, Button as AButton } from 'antdv-next'
import AccountProfile from './AccountProfile.vue'
import ActivityFilters from './ActivityFilters.vue'
import ActivityList from './ActivityList.vue'
import ContentPagination from '../content/ContentPagination.vue'

const { t } = useI18n()
const { kind, channel, page, removing, failed, totals, request, filter, remove } =
  useAccountActivity()
const { data, error, status, refresh } = request
useSeoMeta({ title: () => t('academy.account') })
await request
</script>

<template>
  <main class="account-feature ic-container">
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
      <AAlert v-if="failed" type="error" :title="t('detail.interactionFailed')" show-icon />
      <AAlert v-if="error" type="error" :title="t('academy.requestFailed')" show-icon>
        <template #action
          ><AButton @click="refresh()">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
      <template v-else>
        <ActivityList
          :items="data?.list ?? []"
          :kind="kind"
          :channel="channel"
          :loading="status === 'pending'"
          :removing="removing"
          @remove="remove"
        />
        <ContentPagination
          :total="data?.total ?? 0"
          :page="page"
          :page-size="12"
          @change="page = $event"
        />
      </template>
    </section>
  </main>
</template>

<style scoped>
.account-feature {
  padding-top: 32px;
  padding-bottom: 56px;
}

.account-feature :deep(h1) {
  margin: 0 0 20px;
  font-size: var(--ic-font-size-3xl, 30px);
  letter-spacing: -0.01em;
}

.account-feature__activity {
  margin-top: 32px;
}
</style>
