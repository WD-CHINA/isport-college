<script setup lang="ts">
import { Pagination as APagination } from 'antdv-next'

interface Props {
  total: number
  pageSize: number
}

const props = defineProps<Props>()

const page = defineModel<number>('page', { required: true })
</script>

<template>
  <APagination
    v-model:current="page"
    class="course-pagination"
    :total="props.total"
    :page-size="props.pageSize"
    :show-size-changer="false"
    hide-on-single-page
    responsive
  />
</template>

<style scoped>
.course-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ic-spacing-3, 12px);
  margin-top: var(--ic-spacing-6, 24px);
}
</style>
