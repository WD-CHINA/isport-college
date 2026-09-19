<script setup lang="ts">
import type { Course } from '@isport/shared'
import { Button as AButton, Space as ASpace, Table as ATable } from 'antdv-next'

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

const columns = computed(() => [
  { title: t('admin.tableName'), key: 'name', width: 180 },
  { title: t('admin.tableCategory'), key: 'category', width: 120 },
  { title: t('admin.tableLevel'), key: 'level', width: 110 },
  { title: t('admin.tableCoach'), dataIndex: 'coach', key: 'coach', width: 120 },
  { title: t('admin.tableStartDate'), key: 'startDate', width: 140 },
  { title: t('admin.tableEnrolled'), key: 'enrolled', width: 110 },
  { title: t('admin.tablePrice'), key: 'price', width: 110 },
  { title: t('admin.tableActions'), key: 'actions', fixed: 'right' as const, width: 140 },
])
</script>

<template>
  <ATable
    row-key="id"
    :columns="columns"
    :data-source="courses"
    :loading="loading"
    :pagination="false"
    :scroll="{ x: 1030 }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <strong>{{ localized(record.name) }}</strong>
      </template>
      <template v-else-if="column.key === 'category'">
        {{ t(`course.categories.${record.category}`) }}
      </template>
      <template v-else-if="column.key === 'level'">
        {{ t(`course.levels.${record.level}`) }}
      </template>
      <template v-else-if="column.key === 'startDate'">
        {{ formatDate(record.startDate, locale, 'LL') }}
      </template>
      <template v-else-if="column.key === 'enrolled'">
        {{ record.enrolled }}/{{ record.capacity }}
      </template>
      <template v-else-if="column.key === 'price'">
        {{ formatPrice(record.price) ?? t('course.priceFree') }}
      </template>
      <template v-else-if="column.key === 'actions'">
        <ASpace :size="4">
          <AButton type="link" size="small" @click="emit('edit', record)">
            {{ t('common.edit') }}
          </AButton>
          <AButton type="link" danger size="small" @click="emit('remove', record)">
            {{ t('common.delete') }}
          </AButton>
        </ASpace>
      </template>
    </template>
  </ATable>
</template>
