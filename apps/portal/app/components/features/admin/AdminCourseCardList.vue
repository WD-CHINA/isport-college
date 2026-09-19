<script setup lang="ts">
import type { Course } from '@isport/shared'
import {
  Button as AButton,
  Card as ACard,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Skeleton as ASkeleton,
  Space as ASpace,
  Tag as ATag,
} from 'antdv-next'

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
      <ACard v-for="i in 3" :key="i">
        <ASkeleton active />
      </ACard>
    </template>
    <template v-else>
      <ACard v-for="course in courses" :key="course.id" size="small">
        <template #title>{{ localized(course.name) }}</template>
        <template #extra>
          <ATag color="blue">{{ t(`course.categories.${course.category}`) }}</ATag>
        </template>
        <ADescriptions :column="1" size="small">
          <ADescriptionsItem :label="t('admin.tableCoach')">{{ course.coach }}</ADescriptionsItem>
          <ADescriptionsItem :label="t('admin.tableStartDate')">
            {{ formatDate(course.startDate, locale, 'LL') }}
          </ADescriptionsItem>
          <ADescriptionsItem :label="t('admin.tableEnrolled')">
            {{ course.enrolled }}/{{ course.capacity }}
          </ADescriptionsItem>
          <ADescriptionsItem :label="t('admin.tablePrice')">
            {{ formatPrice(course.price) ?? t('course.priceFree') }}
          </ADescriptionsItem>
        </ADescriptions>
        <ASpace class="admin-course-cards__actions">
          <AButton @click="emit('edit', course)">{{ t('common.edit') }}</AButton>
          <AButton danger @click="emit('remove', course)">{{ t('common.delete') }}</AButton>
        </ASpace>
      </ACard>
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

.admin-course-cards__actions {
  margin-top: var(--ic-spacing-3, 12px);
}
</style>
