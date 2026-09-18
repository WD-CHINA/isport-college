<script setup lang="ts">
import type { Course } from '@isport/shared'

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
  <NuxtLink :to="localePath(`/courses/${course.id}`)" class="course-card">
    <div class="course-card__cover" :style="coverStyle">
      <span class="course-card__category">{{ t(`course.categories.${course.category}`) }}</span>
      <span class="course-card__level">{{ t(`course.levels.${course.level}`) }}</span>
    </div>
    <div class="course-card__body">
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
    </div>
  </NuxtLink>
</template>

<style scoped>
.course-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
  text-decoration: none;
  transition: box-shadow var(--ic-motion-duration-fast, 150ms)
    var(--ic-motion-easing-standard, ease);
}

.course-card:hover {
  box-shadow: var(--ic-box-shadow-md, 0 4px 12px -2px rgb(15 23 42 / 10%));
}

.course-card__cover {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  height: 120px;
  padding: var(--ic-spacing-3, 12px);
}

.course-card__category,
.course-card__level {
  padding: 2px var(--ic-spacing-2, 8px);
  border-radius: var(--ic-border-radius-full, 9999px);
  background: rgb(255 255 255 / 18%);
  color: var(--ic-color-text-inverse, #fff);
  font-size: var(--ic-font-size-xs, 12px);
  backdrop-filter: blur(4px);
}

.course-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ic-spacing-1, 4px);
  padding: var(--ic-spacing-4, 16px);
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
  margin-top: auto;
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
