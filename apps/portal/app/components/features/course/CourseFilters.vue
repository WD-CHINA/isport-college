<script setup lang="ts">
import type { CourseListQuery } from '@isport/api-client'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '@isport/shared'
import type { CourseCategory, CourseLevel } from '@isport/shared'

const model = defineModel<CourseListQuery>({ required: true })

const { t } = useI18n()

const keyword = computed({
  get: () => model.value.keyword ?? '',
  set: (value: string) => patch({ keyword: value.trim() || undefined }),
})

function patch(partial: Partial<CourseListQuery>) {
  // 筛选条件变化时回到第一页，避免停留在空页
  model.value = { ...model.value, ...partial, page: 1 }
}

function onCategoryChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  patch({ category: (value || undefined) as CourseCategory | undefined })
}

function onLevelChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  patch({ level: (value || undefined) as CourseLevel | undefined })
}
</script>

<template>
  <div class="course-filters">
    <input
      v-model="keyword"
      type="search"
      class="course-filters__input"
      :placeholder="t('course.searchPlaceholder')"
      :aria-label="t('common.search')"
    />
    <label class="course-filters__field">
      <span class="course-filters__label">{{ t('course.categoryLabel') }}</span>
      <select
        class="course-filters__select"
        :value="model.category ?? ''"
        @change="onCategoryChange"
      >
        <option value="">{{ t('common.all') }}</option>
        <option v-for="cat in COURSE_CATEGORIES" :key="cat" :value="cat">
          {{ t(`course.categories.${cat}`) }}
        </option>
      </select>
    </label>
    <label class="course-filters__field">
      <span class="course-filters__label">{{ t('course.levelLabel') }}</span>
      <select class="course-filters__select" :value="model.level ?? ''" @change="onLevelChange">
        <option value="">{{ t('common.all') }}</option>
        <option v-for="lv in COURSE_LEVELS" :key="lv" :value="lv">
          {{ t(`course.levels.${lv}`) }}
        </option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.course-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-3, 12px);
}

.course-filters__input,
.course-filters__select {
  min-height: 44px;
  padding: 0 var(--ic-spacing-3, 12px);
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-md, 8px);
  background: var(--ic-color-background-container, #fff);
  color: var(--ic-color-text-primary, #0f172a);
  font-size: var(--ic-font-size-sm, 14px);
}

.course-filters__input {
  flex: 1 1 220px;
}

.course-filters__input:focus-visible,
.course-filters__select:focus-visible {
  border-color: var(--ic-color-brand-500, #2563eb);
  outline: 2px solid var(--ic-color-brand-200, #bfdbfe);
}

.course-filters__field {
  display: inline-flex;
  align-items: center;
  gap: var(--ic-spacing-2, 8px);
}

.course-filters__label {
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
  white-space: nowrap;
}
</style>
