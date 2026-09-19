<script setup lang="ts">
import type { Course } from '@isport/shared'
import { Card as ACard, Tag as ATag } from 'antdv-next'

interface Props {
  course: Course
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const localized = useLocalizedText()

const coverStyle = computed(() => ({
  backgroundImage: `linear-gradient(135deg, var(--ic-color-category-${props.course.category}, #2563eb), color-mix(in srgb, var(--ic-color-category-${props.course.category}, #2563eb) 60%, #0f172a))`,
}))

const priceText = computed(() => formatPrice(props.course.price))
const startDateText = computed(() => formatDate(props.course.startDate, locale.value, 'LL'))
</script>

<template>
  <NuxtLink :to="localePath(`/courses/${course.id}`)" class="course-card-link">
    <ACard hoverable class="course-card">
      <template #cover>
        <div class="course-card__cover" :style="coverStyle">
          <ATag class="course-card__tag">{{ t(`course.categories.${course.category}`) }}</ATag>
          <ATag class="course-card__tag">{{ t(`course.levels.${course.level}`) }}</ATag>
        </div>
      </template>
      <h3 class="course-card__name">{{ localized(course.name) }}</h3>
      <p class="course-card__meta">{{ t('course.coach') }} · {{ course.coach }}</p>
      <p class="course-card__meta">
        {{ startDateText }} · {{ course.durationMin }}{{ t('course.durationUnit') }}
      </p>
      <div class="course-card__foot">
        <span class="course-card__enrolled">
          {{ t('course.enrolledCount') }} {{ course.enrolled }}/{{ course.capacity }}
        </span>
        <span class="course-card__price">
          {{ priceText ?? t('course.priceFree') }}
        </span>
      </div>
    </ACard>
  </NuxtLink>
</template>

<style scoped>
.course-card-link {
  display: block;
  height: 100%;
  text-decoration: none;
}

.course-card {
  height: 100%;
}

.course-card__cover {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  height: 120px;
  padding: var(--ic-spacing-3, 12px);
}

.course-card__tag {
  margin-inline-end: 0;
  border-color: transparent;
  background: rgb(255 255 255 / 18%);
  color: var(--ic-color-text-inverse, #fff);
  backdrop-filter: blur(4px);
}

.course-card__name {
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
  color: var(--ic-color-text-primary, #0f172a);
}

.course-card__meta {
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}

.course-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--ic-spacing-3, 12px);
  padding-top: var(--ic-spacing-3, 12px);
}

.course-card__enrolled {
  font-size: var(--ic-font-size-xs, 12px);
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.course-card__price {
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-bold, 700);
  color: var(--ic-color-accent, #f97316);
}
</style>
