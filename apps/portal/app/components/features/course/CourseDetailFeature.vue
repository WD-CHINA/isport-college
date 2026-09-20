<script setup lang="ts">
import { fetchCourseDetail } from '~/api/course'
import { RichTextContent } from '@isport/rich-text'
import {
  Button as AButton,
  Card as ACard,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Skeleton as ASkeleton,
  Tag as ATag,
} from 'antdv-next'

interface Props {
  courseId: string
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const localized = useLocalizedText()

const {
  data: course,
  status,
  error,
} = await useAsyncData(`course-detail-${props.courseId}`, () => fetchCourseDetail(props.courseId))

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
          <ATag class="course-detail__tag">{{ t(`course.categories.${course.category}`) }}</ATag>
          <ATag class="course-detail__tag">{{ t(`course.levels.${course.level}`) }}</ATag>
        </div>
        <h1 class="course-detail__name">{{ localized(course.name) }}</h1>
        <p class="course-detail__coach">{{ t('course.coach') }} · {{ course.coach }}</p>
      </div>
    </div>

    <div class="course-detail__grid">
      <div class="course-detail__main">
        <ACard :title="t('course.courseDesc')">
          <RichTextContent :content="localized(course.description)" />
        </ACard>
        <ACard :title="t('course.schedule')" class="course-detail__section">
          <p class="course-detail__text">{{ localized(course.schedule) }}</p>
        </ACard>
      </div>

      <ACard class="course-detail__aside">
        <ADescriptions :column="1" size="small" :colon="false">
          <ADescriptionsItem :label="t('course.startDate')">{{ startDateText }}</ADescriptionsItem>
          <ADescriptionsItem :label="t('course.duration')">
            {{ course.durationMin }}{{ t('course.durationUnit') }}
          </ADescriptionsItem>
          <ADescriptionsItem :label="t('course.location')">
            {{ localized(course.location) }}
          </ADescriptionsItem>
          <ADescriptionsItem :label="t('course.enrolledCount')">
            {{ course.enrolled }}/{{ course.capacity }}
          </ADescriptionsItem>
        </ADescriptions>
        <p class="course-detail__price">
          {{ priceText ?? t('course.priceFree') }}
        </p>
        <AButton
          type="primary"
          block
          size="large"
          class="course-detail__enroll"
          :loading="enrolling"
          :disabled="enrolling || enrolled || isFull"
          @click="enroll"
        >
          <template v-if="enrolled">{{ t('course.enrolled') }}</template>
          <template v-else-if="isFull">{{ t('course.enrollFull') }}</template>
          <template v-else>{{ t('course.enroll') }}</template>
        </AButton>
      </ACard>
    </div>
  </section>
  <div v-else-if="loading" class="container-page course-detail__loading">
    <ASkeleton active />
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
  margin-inline-end: 0;
  border-color: transparent;
  background: rgb(255 255 255 / 18%);
  color: var(--ic-color-text-inverse, #fff);
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
  margin-top: var(--ic-spacing-4, 16px);
}

.course-detail__text {
  line-height: var(--ic-line-height-relaxed, 1.75);
  color: var(--ic-color-text-secondary, #475569);
  white-space: pre-line;
}

.course-detail__aside {
  align-self: start;
}

.course-detail__price {
  margin-top: var(--ic-spacing-3, 12px);
  font-size: var(--ic-font-size-2xl, 24px);
  font-weight: var(--ic-font-weight-bold, 700);
  color: var(--ic-color-accent, #f97316);
}

.course-detail__enroll {
  margin-top: var(--ic-spacing-3, 12px);
}

.course-detail__loading {
  padding: var(--ic-spacing-16, 64px) 0;
  text-align: center;
  color: var(--ic-color-text-secondary, #475569);
}
</style>
