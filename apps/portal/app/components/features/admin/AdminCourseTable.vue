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
  <div class="admin-course-table__wrap">
    <table class="admin-course-table">
      <thead>
        <tr>
          <th>{{ t('admin.tableName') }}</th>
          <th>{{ t('admin.tableCategory') }}</th>
          <th>{{ t('admin.tableLevel') }}</th>
          <th>{{ t('admin.tableCoach') }}</th>
          <th>{{ t('admin.tableStartDate') }}</th>
          <th>{{ t('admin.tableEnrolled') }}</th>
          <th>{{ t('admin.tablePrice') }}</th>
          <th class="admin-course-table__actions-col">{{ t('admin.tableActions') }}</th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr v-for="i in 5" :key="i">
          <td colspan="8">
            <div class="admin-course-table__skeleton" />
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="course in courses" :key="course.id">
          <td class="admin-course-table__name">{{ localized(course.name) }}</td>
          <td>{{ t(`course.categories.${course.category}`) }}</td>
          <td>{{ t(`course.levels.${course.level}`) }}</td>
          <td>{{ course.coach }}</td>
          <td>{{ formatDate(course.startDate, locale, 'LL') }}</td>
          <td>{{ course.enrolled }}/{{ course.capacity }}</td>
          <td>{{ formatPrice(course.price) ?? t('course.priceFree') }}</td>
          <td class="admin-course-table__actions-col">
            <button type="button" class="link" @click="emit('edit', course)">
              {{ t('common.edit') }}
            </button>
            <button
              type="button"
              class="link admin-course-table__remove"
              @click="emit('remove', course)"
            >
              {{ t('common.delete') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-course-table__wrap {
  overflow-x: auto;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
}

.admin-course-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--ic-font-size-sm, 14px);
}

.admin-course-table th,
.admin-course-table td {
  padding: var(--ic-spacing-3, 12px) var(--ic-spacing-4, 16px);
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
  text-align: left;
  white-space: nowrap;
}

.admin-course-table th {
  background: var(--ic-color-background-page, #f8fafc);
  color: var(--ic-color-text-secondary, #475569);
  font-weight: var(--ic-font-weight-medium, 500);
}

.admin-course-table tbody tr:last-child td {
  border-bottom: none;
}

.admin-course-table__name {
  font-weight: var(--ic-font-weight-medium, 500);
  color: var(--ic-color-text-primary, #0f172a);
}

.admin-course-table__actions-col {
  text-align: right;
}

.admin-course-table__actions-col .link + .link {
  margin-left: var(--ic-spacing-3, 12px);
}

.admin-course-table__remove {
  color: var(--ic-color-semantic-error, #dc2626);
}

.admin-course-table__skeleton {
  height: 20px;
  border-radius: var(--ic-border-radius-sm, 4px);
  background: var(--ic-color-border-base, #e2e8f0);
}
</style>
