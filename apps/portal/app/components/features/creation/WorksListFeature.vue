<script setup lang="ts">
import type { WorkStatus } from '@isport/shared'
import { Alert as AAlert, Button as AButton, Tag as ATag } from 'antdv-next'

const { t } = useI18n()
const localePath = useLocalePath()
const { request, status, page, filterStatus, changePage } = useMyWorks()
const { data, error, status: requestStatus } = request
useSeoMeta({ title: () => t('creation.works.title') })
await request

const statusOptions: Array<{ value?: WorkStatus; label: string }> = [
  { value: undefined, label: t('creation.works.allStatus') },
  { value: 'draft', label: t('creation.works.statuses.draft') },
  { value: 'pending', label: t('creation.works.statuses.pending') },
  { value: 'published', label: t('creation.works.statuses.published') },
  { value: 'rejected', label: t('creation.works.statuses.rejected') },
]

const statusColor: Record<WorkStatus, string> = {
  draft: 'default',
  pending: 'processing',
  published: 'success',
  rejected: 'error',
}

function fmtDate(s: string) {
  return s ? new Date(s).toLocaleDateString() : ''
}
</script>

<template>
  <div class="works-list ic-container">
    <header class="works-list__header">
      <h1>{{ t('creation.works.title') }}</h1>
      <NuxtLink :to="localePath('/admin/works/submit')">
        <AButton type="primary">{{ t('creation.works.newWork') }}</AButton>
      </NuxtLink>
    </header>

    <nav class="works-list__filters" :aria-label="t('creation.works.filterStatus')">
      <AButton
        v-for="opt in statusOptions"
        :key="opt.label"
        :type="status === opt.value ? 'primary' : 'default'"
        size="small"
        @click="filterStatus(opt.value)"
      >
        {{ opt.label }}
      </AButton>
    </nav>

    <AAlert v-if="error" type="error" :title="t('academy.requestFailed')" show-icon />
    <p v-else-if="requestStatus === 'pending'" role="status">{{ t('common.loading') }}</p>
    <p v-else-if="!data?.list.length" class="works-list__empty">
      {{ t('creation.works.noWorks') }}
    </p>
    <template v-else>
      <ul class="works-list__items">
        <li v-for="work in data.list" :key="work.id" class="works-list__item">
          <div class="works-list__item-head">
            <strong>{{ work.title || t('creation.submission.title') }}</strong>
            <ATag :color="statusColor[work.status]">
              {{ t(`creation.works.statuses.${work.status}`) }}
            </ATag>
            <ATag v-if="work.offline" color="warning">{{ t('creation.works.offlineBadge') }}</ATag>
          </div>
          <p class="works-list__item-meta">
            {{ t(`creation.entries.${work.kind}`) }} ·
            {{ t('creation.works.updated', { date: fmtDate(work.updatedAt) }) }}
          </p>
          <div class="works-list__item-actions">
            <NuxtLink :to="localePath(`/admin/works/${work.id}`)">
              <AButton size="small">{{ t('creation.works.viewWork') }}</AButton>
            </NuxtLink>
            <NuxtLink
              v-if="work.status === 'draft'"
              :to="localePath(`/admin/works/submit?id=${work.id}`)"
            >
              <AButton size="small" type="primary">{{ t('creation.works.editDraft') }}</AButton>
            </NuxtLink>
            <NuxtLink
              v-if="work.status === 'rejected'"
              :to="localePath(`/admin/works/submit?id=${work.id}`)"
            >
              <AButton size="small" type="primary">{{ t('creation.works.editRejected') }}</AButton>
            </NuxtLink>
            <NuxtLink
              v-if="work.status === 'published' && work.contentId && !work.offline"
              :to="localePath(`/resources/${work.contentId}`)"
            >
              <AButton size="small">{{ t('creation.works.viewPublished') }}</AButton>
            </NuxtLink>
          </div>
        </li>
      </ul>
      <ContentPagination
        :total="data.total"
        :page="page"
        :page-size="data.pageSize"
        @change="changePage"
      />
    </template>
  </div>
</template>

<style scoped>
.works-list {
  padding-top: 32px;
  padding-bottom: 56px;
}

.works-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.works-list__header h1 {
  margin: 0;
  font-size: var(--ic-font-size-3xl, 28px);
  letter-spacing: -0.01em;
}

.works-list__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.works-list__empty {
  margin: 0;
  padding: 48px 12px;
  border: 1px dashed var(--ic-color-border-strong, #cbd5e1);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
  color: var(--ic-color-text-secondary, #64748b);
  text-align: center;
}

.works-list__items {
  display: grid;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
}

.works-list__item {
  padding: 20px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));
  transition:
    transform var(--ic-motion-duration-normal, 250ms) var(--ic-motion-easing-standard),
    box-shadow var(--ic-motion-duration-normal, 250ms) var(--ic-motion-easing-standard);
}

.works-list__item:hover {
  transform: translateY(-2px);
  box-shadow: var(--ic-box-shadow-md, 0 4px 12px -2px rgb(15 23 42 / 10%));
}

.works-list__item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.works-list__item-head strong {
  font-size: var(--ic-font-size-lg, 18px);
}

.works-list__item-meta {
  margin: 0 0 12px;
  color: var(--ic-color-text-secondary, #64748b);
  font-size: var(--ic-font-size-sm, 14px);
}

.works-list__item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
