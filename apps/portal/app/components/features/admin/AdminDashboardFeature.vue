<script setup lang="ts">
import { AdminPageHeader } from '@isport/ui-admin'
import { useAuthStore } from '~/stores/auth'

const { t, locale } = useI18n()
const localized = useLocalizedText()
const auth = useAuthStore()

const { data: latest, status: latestStatus } = await useCourseList({
  key: 'admin-latest-courses',
  query: { page: 1, pageSize: 5 },
})

const latestCourses = computed(() => latest.value?.list ?? [])
const latestLoading = computed(() => latestStatus.value === 'pending')
</script>

<template>
  <section class="admin-dashboard">
    <AdminPageHeader
      :title="t('nav.dashboard')"
      :description="t('admin.welcome', { name: auth.user?.name ?? '' })"
    />

    <section class="admin-dashboard__latest">
      <h2 class="admin-dashboard__latest-title">{{ t('admin.latestCourses') }}</h2>
      <div v-if="latestLoading" class="admin-dashboard__skeleton" />
      <ul v-else class="admin-dashboard__latest-list">
        <li v-for="course in latestCourses" :key="course.id" class="admin-dashboard__latest-item">
          <div>
            <p class="admin-dashboard__latest-name">{{ localized(course.name) }}</p>
            <p class="admin-dashboard__latest-meta">
              {{ formatDate(course.startDate, locale, 'LL') }} · {{ course.coach }}
            </p>
          </div>
          <span class="admin-dashboard__latest-enrolled">
            {{ t('course.enrolledCount') }} {{ course.enrolled }}/{{ course.capacity }}
          </span>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.admin-dashboard__latest {
  margin-top: var(--ic-spacing-6, 24px);
  padding: var(--ic-spacing-5, 20px);
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
}

.admin-dashboard__latest-title {
  font-size: var(--ic-font-size-lg, 18px);
  font-weight: var(--ic-font-weight-semibold, 600);
  margin-bottom: var(--ic-spacing-3, 12px);
}

.admin-dashboard__latest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ic-spacing-3, 12px);
  padding: var(--ic-spacing-3, 12px) 0;
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
}

.admin-dashboard__latest-item:last-child {
  border-bottom: none;
}

.admin-dashboard__latest-name {
  font-weight: var(--ic-font-weight-medium, 500);
  color: var(--ic-color-text-primary, #0f172a);
}

.admin-dashboard__latest-meta {
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}

.admin-dashboard__latest-enrolled {
  flex-shrink: 0;
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.admin-dashboard__skeleton {
  height: 160px;
  border-radius: var(--ic-border-radius-md, 8px);
  background: var(--ic-color-border-base, #e2e8f0);
}
</style>
