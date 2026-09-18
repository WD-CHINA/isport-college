<script setup lang="ts">
interface Props {
  total: number
  pageSize: number
}

const props = defineProps<Props>()

const page = defineModel<number>('page', { required: true })

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < totalPages.value)
</script>

<template>
  <nav v-if="totalPages > 1" class="course-pagination" aria-label="pagination">
    <button
      type="button"
      class="btn-outline course-pagination__btn"
      :disabled="!canPrev"
      @click="page -= 1"
    >
      ‹
    </button>
    <span class="course-pagination__info">{{ page }} / {{ totalPages }}</span>
    <button
      type="button"
      class="btn-outline course-pagination__btn"
      :disabled="!canNext"
      @click="page += 1"
    >
      ›
    </button>
  </nav>
</template>

<style scoped>
.course-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ic-spacing-3, 12px);
  margin-top: var(--ic-spacing-6, 24px);
}

.course-pagination__btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0 var(--ic-spacing-3, 12px);
  font-size: var(--ic-font-size-lg, 18px);
}

.course-pagination__btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.course-pagination__info {
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}
</style>
