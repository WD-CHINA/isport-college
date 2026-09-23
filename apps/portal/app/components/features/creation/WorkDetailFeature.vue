<script setup lang="ts">
import type { WorkStatus } from '@isport/shared'
import {
  Alert as AAlert,
  Button as AButton,
  Descriptions as ADesc,
  DescriptionsItem as ADescItem,
  Tag as ATag,
} from 'antdv-next'

const props = defineProps<{ id: string }>()
const { t } = useI18n()
const localePath = useLocalePath()
const academy = useAcademy()
const auth = useAuthStore()

const key = computed(() => `academy:work:${auth.user?.id}:${props.id}`)
const { data, error, pending, refresh } = useAsyncData(key, (_app, { signal }) =>
  academy.call('work/detail', { id: props.id }, signal),
)
useSeoMeta({ title: () => t('creation.works.detail') })
await useAsyncData(key, (_app, { signal }) => academy.call('work/detail', { id: props.id }, signal))

const statusColor: Record<WorkStatus, string> = {
  draft: 'default',
  pending: 'processing',
  published: 'success',
  rejected: 'error',
}

function fmtDate(s: string) {
  return s ? new Date(s).toLocaleDateString() : ''
}

function contentPath(id: string) {
  return localePath(`/resources/${id}`)
}
</script>

<template>
  <div class="work-detail ic-container">
    <AAlert v-if="error" type="error" :title="t('academy.requestFailed')" show-icon>
      <template #action
        ><AButton @click="refresh()">{{ t('catalog.retry') }}</AButton></template
      >
    </AAlert>
    <p v-else-if="pending" role="status">{{ t('common.loading') }}</p>
    <template v-else-if="data">
      <header class="work-detail__header">
        <h1>{{ data.work.title || t('creation.submission.title') }}</h1>
        <div class="work-detail__badges">
          <ATag :color="statusColor[data.work.status]">
            {{ t(`creation.works.statuses.${data.work.status}`) }}
          </ATag>
          <ATag v-if="data.work.offline" color="warning">{{
            t('creation.works.offlineBadge')
          }}</ATag>
        </div>
      </header>

      <ADesc bordered :column="1" size="small" class="work-detail__meta">
        <ADescItem :label="t('creation.submission.selectType')">
          {{ t(`creation.entries.${data.work.kind}`) }}
        </ADescItem>
        <ADescItem :label="t('creation.works.updated', { date: '' })">
          {{ fmtDate(data.work.updatedAt) }}
        </ADescItem>
        <ADescItem v-if="data.work.submittedAt" label="提交时间">
          {{ fmtDate(data.work.submittedAt) }}
        </ADescItem>
        <ADescItem :label="t('creation.works.publishedContent')">
          <template v-if="data.work.contentId && !data.work.offline">
            <NuxtLink :to="contentPath(data.work.contentId)">
              <AButton size="small">{{ t('creation.works.viewPublished') }}</AButton>
            </NuxtLink>
          </template>
          <span v-else-if="data.work.offline" class="work-detail__warn">{{
            t('creation.works.contentOffline')
          }}</span>
          <span v-else class="work-detail__muted">{{ t('creation.works.unpublished') }}</span>
        </ADescItem>
      </ADesc>

      <section v-if="data.work.status === 'rejected'" class="work-detail__reject">
        <AAlert
          type="error"
          show-icon
          :title="t('creation.works.rejectReason')"
          :description="data.reviews.at(-1)?.reason"
        />
        <NuxtLink :to="localePath(`/admin/works/submit?id=${data.work.id}`)">
          <AButton type="primary" class="work-detail__resubmit">{{
            t('creation.works.editRejected')
          }}</AButton>
        </NuxtLink>
      </section>

      <section v-if="data.work.status === 'draft'" class="work-detail__draft">
        <NuxtLink :to="localePath(`/admin/works/submit?id=${data.work.id}`)">
          <AButton type="primary">{{ t('creation.works.editDraft') }}</AButton>
        </NuxtLink>
      </section>

      <section class="work-detail__reviews">
        <h2>{{ t('creation.works.reviewHistory') }}</h2>
        <p v-if="!data.reviews.length" class="work-detail__muted">
          {{ t('creation.works.noReviews') }}
        </p>
        <ul v-else class="work-detail__review-list">
          <li v-for="rev in data.reviews" :key="rev.id" class="work-detail__review-item">
            <ATag :color="rev.result === 'approved' ? 'success' : 'error'">
              {{
                rev.result === 'approved'
                  ? t('creation.works.approvedAt')
                  : t('creation.works.rejectAt')
              }}
            </ATag>
            <span>{{ fmtDate(rev.createdAt) }}</span>
            <p v-if="rev.reason">{{ rev.reason }}</p>
          </li>
        </ul>
      </section>

      <NuxtLink :to="localePath('/admin/works')">
        <AButton class="work-detail__back">&larr; {{ t('creation.works.title') }}</AButton>
      </NuxtLink>
    </template>
  </div>
</template>

<style scoped>
.work-detail {
  max-width: 720px;
  padding-top: 32px;
  padding-bottom: 56px;
}

.work-detail__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.work-detail__header h1 {
  margin: 0;
  font-size: var(--ic-font-size-2xl, 26px);
  flex: 1;
  min-width: 200px;
}

.work-detail__badges {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 4px;
}

.work-detail__meta {
  margin-bottom: 24px;
}

.work-detail__warn {
  color: var(--ic-color-semantic-warning, #d97706);
}

.work-detail__muted {
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.work-detail__resubmit {
  margin-top: 12px;
}

.work-detail__reject,
.work-detail__draft {
  margin-bottom: 24px;
}

.work-detail__reviews h2 {
  margin: 0 0 12px;
  font-size: var(--ic-font-size-lg, 18px);
}

.work-detail__review-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.work-detail__review-item {
  padding: 12px 14px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-md, 8px);
  background: var(--ic-color-background-container, #fff);
}

.work-detail__review-item p {
  margin: 6px 0 0;
  color: var(--ic-color-text-secondary, #64748b);
  font-size: var(--ic-font-size-sm, 14px);
}

.work-detail__back {
  margin-top: 16px;
}
</style>
