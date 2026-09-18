<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="admin-page-header">
    <div class="admin-page-header__text">
      <h1 class="admin-page-header__title">{{ title }}</h1>
      <p v-if="description" class="admin-page-header__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.extra" class="admin-page-header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.admin-page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ic-spacing-3, 12px);
  margin-bottom: var(--ic-spacing-4, 16px);
}

.admin-page-header__title {
  margin: 0;
  font-size: var(--ic-font-size-xl, 20px);
  font-weight: var(--ic-font-weight-semibold, 600);
  line-height: var(--ic-line-height-tight, 1.25);
}

.admin-page-header__desc {
  margin: var(--ic-spacing-1, 4px) 0 0;
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}

.admin-page-header__extra {
  display: inline-flex;
  align-items: center;
  gap: var(--ic-spacing-2, 8px);
}
</style>
