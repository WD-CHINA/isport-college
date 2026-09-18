<script setup lang="ts">
import type { Course } from '@isport/shared'

interface Props {
  courses: Course[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  edit: [course: Course]
  remove: [course: Course]
}>()

const { t, locale } = useI18n()
const localized = useLocalizedText()
</script>

<template>
  <div class="admin-course-cards">
    <p class="admin-course-cards__tip">{{ t('admin.mobileCardView') }}</p>
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="admin-course-cards__skeleton" aria-hidden="true" />
    </template>
    <template v-else>
      <article v-for="course in courses" :key="course.id" class="admin-course-cards__card">
        <header class="admin-course-cards__head">
          <h3 class="admin-course-cards__name">{{ localized(course.name) }}</h3>
          <span class="admin-course-cards__tag">{{
            t(`course.categories.${course.category}`)
          }}</span>
        </header>
        <dl class="admin-course-cards__facts">
          <div>
            <dt>{{ t('admin.tableCoach') }}</dt>
            <dd>{{ course.coach }}</dd>
          </div>
          <div>
            <dt>{{ t('admin.tableStartDate') }}</dt>
            <dd>{{ formatDate(course.startDate, locale, 'LL') }}</dd>
          </div>
          <div>
            <dt>{{ t('admin.tableEnrolled') }}</dt>
            <dd>{{ course.enrolled }}/{{ course.capacity }}</dd>
          </div>
          <div>
            <dt>{{ t('admin.tablePrice') }}</dt>
            <dd>{{ formatPrice(course.price) ?? t('course.priceFree') }}</dd>
          </div>
        </dl>
        <footer class="admin-course-cards__actions">
          <button type="button" class="btn-outline" @click="emit('edit', course)">
            {{ t('common.edit') }}
          </button>
          <button
            type="button"
            class="btn-outline admin-course-cards__remove"
            @click="emit('remove', course)"
          >
            {{ t('common.delete') }}
          </button>
        </footer>
      </article>
    </template>
  </div>
</template>

<style scoped>
.admin-course-cards {
  display: flex;
  flex-direction: column;
  gap: var(--ic-spacing-3, 12px);
}

.admin-course-cards__tip {
  font-size: var(--ic-font-size-xs, 12px);
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.admin-course-cards__card {
  padding: var(--ic-spacing-4, 16px);
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
}

.admin-course-cards__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ic-spacing-2, 8px);
}

.admin-course-cards__name {
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.admin-course-cards__tag {
  flex-shrink: 0;
  padding: 2px var(--ic-spacing-2, 8px);
  border-radius: var(--ic-border-radius-full, 9999px);
  background: var(--ic-color-brand-50, #eff6ff);
  color: var(--ic-color-brand-600, #1d4ed8);
  font-size: var(--ic-font-size-xs, 12px);
}

.admin-course-cards__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ic-spacing-2, 8px);
  margin: var(--ic-spacing-3, 12px) 0;
  font-size: var(--ic-font-size-sm, 14px);
}

.admin-course-cards__facts dt {
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-xs, 12px);
}

.admin-course-cards__facts dd {
  color: var(--ic-color-text-primary, #0f172a);
}

.admin-course-cards__actions {
  display: flex;
  gap: var(--ic-spacing-2, 8px);
}

.admin-course-cards__actions .btn-outline {
  flex: 1;
  min-height: 44px;
}

.admin-course-cards__remove {
  color: var(--ic-color-semantic-error, #dc2626);
}

.admin-course-cards__skeleton {
  height: 180px;
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-border-base, #e2e8f0);
}
</style>
