<script setup lang="ts">
interface Props {
  courseId: string
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const { $courseRepository } = useNuxtApp()
const localized = useLocalizedText()

const {
  data: course,
  status,
  error,
} = await useAsyncData(`course-detail-${props.courseId}`, () =>
  $courseRepository.getById(props.courseId),
)

const loading = computed(() => status.value === 'pending')
const priceText = computed(() => (course.value ? formatPrice(course.value.price) : null))
const startDateText = computed(() =>
  course.value ? formatDate(course.value.startDate, locale.value, 'LL') : '',
)
const isFull = computed(() =>
  course.value ? course.value.enrolled >= course.value.capacity : false,
)

const { enrolling, enrolled, enroll } = useCourseEnrollment(() => props.courseId)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Course Not Found', fatal: true })
}
</script>

<template>
  <section v-if="course" class="container-page course-detail">
    <div
      class="course-detail__cover"
      :style="{
        backgroundImage: `linear-gradient(135deg, var(--ic-color-category-${course.category}, #2563eb), color-mix(in srgb, var(--ic-color-category-${course.category}, #2563eb) 60%, #0f172a))`,
      }"
    >
      <div class="course-detail__cover-inner">
        <div class="course-detail__tags">
          <span class="course-detail__tag">{{ t(`course.categories.${course.category}`) }}</span>
          <span class="course-detail__tag">{{ t(`course.levels.${course.level}`) }}</span>
        </div>
        <h1 class="course-detail__name">{{ localized(course.name) }}</h1>
        <p class="course-detail__coach">{{ t('course.coach') }} · {{ course.coach }}</p>
      </div>
    </div>

    <div class="course-detail__grid">
      <div class="course-detail__main">
        <section class="course-detail__section">
          <h2 class="course-detail__section-title">{{ t('course.courseDesc') }}</h2>
          <p class="course-detail__text">{{ localized(course.description) }}</p>
        </section>
        <section class="course-detail__section">
          <h2 class="course-detail__section-title">{{ t('course.schedule') }}</h2>
          <p class="course-detail__text">{{ localized(course.schedule) }}</p>
        </section>
      </div>

      <aside class="course-detail__aside">
        <dl class="course-detail__facts">
          <div class="course-detail__fact">
            <dt>{{ t('course.startDate') }}</dt>
            <dd>{{ startDateText }}</dd>
          </div>
          <div class="course-detail__fact">
            <dt>{{ t('course.duration') }}</dt>
            <dd>{{ course.durationMin }}{{ t('course.durationUnit') }}</dd>
          </div>
          <div class="course-detail__fact">
            <dt>{{ t('course.location') }}</dt>
            <dd>{{ localized(course.location) }}</dd>
          </div>
          <div class="course-detail__fact">
            <dt>{{ t('course.enrolledCount') }}</dt>
            <dd>{{ course.enrolled }}/{{ course.capacity }}</dd>
          </div>
        </dl>
        <p class="course-detail__price">
          {{ priceText ?? t('course.priceFree') }}
        </p>
        <button
          type="button"
          class="btn-primary course-detail__enroll"
          :disabled="enrolling || enrolled || isFull"
          @click="enroll"
        >
          <template v-if="enrolled">{{ t('course.enrolled') }}</template>
          <template v-else-if="isFull">{{ t('course.enrollFull') }}</template>
          <template v-else>{{ t('course.enroll') }}</template>
        </button>
      </aside>
    </div>
  </section>
  <div v-else-if="loading" class="container-page course-detail__loading">
    {{ t('common.loading') }}
  </div>
</template>

<style scoped>
.course-detail {
  padding-top: var(--ic-spacing-8, 32px);
  padding-bottom: var(--ic-spacing-16, 64px);
}

.course-detail__cover {
  display: flex;
  align-items: flex-end;
  min-height: 240px;
  border-radius: var(--ic-border-radius-lg, 12px);
  color: var(--ic-color-text-inverse, #fff);
}

.course-detail__cover-inner {
  padding: var(--ic-spacing-6, 24px);
}

.course-detail__tags {
  display: flex;
  gap: var(--ic-spacing-2, 8px);
  margin-bottom: var(--ic-spacing-3, 12px);
}

.course-detail__tag {
  padding: 2px var(--ic-spacing-2, 8px);
  border-radius: var(--ic-border-radius-full, 9999px);
  background: rgb(255 255 255 / 18%);
  font-size: var(--ic-font-size-xs, 12px);
  backdrop-filter: blur(4px);
}

.course-detail__name {
  font-size: var(--ic-font-size-3xl, 30px);
  font-weight: var(--ic-font-weight-bold, 700);
}

.course-detail__coach {
  margin-top: var(--ic-spacing-1, 4px);
  opacity: 0.9;
}

.course-detail__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ic-spacing-6, 24px);
  margin-top: var(--ic-spacing-6, 24px);
}

@media (min-width: 1024px) {
  .course-detail__grid {
    grid-template-columns: 1fr 320px;
  }
}

.course-detail__section {
  padding: var(--ic-spacing-5, 20px);
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
}

.course-detail__section + .course-detail__section {
  margin-top: var(--ic-spacing-4, 16px);
}

.course-detail__section-title {
  font-size: var(--ic-font-size-lg, 18px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.course-detail__text {
  margin-top: var(--ic-spacing-2, 8px);
  line-height: var(--ic-line-height-relaxed, 1.75);
  color: var(--ic-color-text-secondary, #475569);
  white-space: pre-line;
}

.course-detail__aside {
  align-self: start;
  padding: var(--ic-spacing-5, 20px);
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
}

.course-detail__fact {
  display: flex;
  justify-content: space-between;
  gap: var(--ic-spacing-3, 12px);
  padding: var(--ic-spacing-2, 8px) 0;
  font-size: var(--ic-font-size-sm, 14px);
}

.course-detail__fact dt {
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.course-detail__fact dd {
  color: var(--ic-color-text-primary, #0f172a);
  text-align: right;
}

.course-detail__price {
  margin-top: var(--ic-spacing-3, 12px);
  font-size: var(--ic-font-size-2xl, 24px);
  font-weight: var(--ic-font-weight-bold, 700);
  color: var(--ic-color-accent, #f97316);
}

.course-detail__enroll {
  width: 100%;
  margin-top: var(--ic-spacing-3, 12px);
  min-height: 44px;
}

.course-detail__enroll:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.course-detail__loading {
  padding: var(--ic-spacing-16, 64px) 0;
  text-align: center;
  color: var(--ic-color-text-secondary, #475569);
}
</style>
