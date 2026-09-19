<script setup lang="ts">
import type { CourseListQuery } from '@isport/api-client'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '@isport/shared'
import type { CourseCategory, CourseLevel } from '@isport/shared'
import { InputSearch as AInputSearch, Select as ASelect } from 'antdv-next'

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

const categoryOptions = computed(() => [
  { label: t('common.all'), value: '' },
  ...COURSE_CATEGORIES.map(value => ({ label: t(`course.categories.${value}`), value })),
])

const levelOptions = computed(() => [
  { label: t('common.all'), value: '' },
  ...COURSE_LEVELS.map(value => ({ label: t(`course.levels.${value}`), value })),
])

function onCategoryChange(value: string) {
  patch({ category: (value || undefined) as CourseCategory | undefined })
}

function onLevelChange(value: string) {
  patch({ level: (value || undefined) as CourseLevel | undefined })
}
</script>

<template>
  <div class="course-filters">
    <AInputSearch
      v-model:value="keyword"
      class="course-filters__input"
      :placeholder="t('course.searchPlaceholder')"
      :aria-label="t('common.search')"
      allow-clear
    />
    <label class="course-filters__field">
      <span class="course-filters__label">{{ t('course.categoryLabel') }}</span>
      <ASelect
        class="course-filters__select"
        :value="model.category ?? ''"
        :options="categoryOptions"
        @change="onCategoryChange"
      />
    </label>
    <label class="course-filters__field">
      <span class="course-filters__label">{{ t('course.levelLabel') }}</span>
      <ASelect
        class="course-filters__select"
        :value="model.level ?? ''"
        :options="levelOptions"
        @change="onLevelChange"
      />
    </label>
  </div>
</template>

<style scoped>
.course-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-3, 12px);
}

.course-filters__input {
  flex: 1 1 220px;
  min-width: 220px;
}

.course-filters__select {
  min-width: 140px;
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
