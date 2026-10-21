<script setup lang="ts">
defineProps<{
  channel: 'research' | 'school'
  categories: { id: string; name: string }[]
  category?: string
}>()
const emit = defineEmits<{ change: [category: string] }>()
const { t } = useI18n()
</script>

<template>
  <div class="catalog-category-tabs" role="group" :aria-label="t('catalog.category')">
    <button
      v-if="channel === 'school'"
      type="button"
      :aria-pressed="!category"
      @click="emit('change', '')"
    >
      <span>{{ t('catalog.allCases') }}</span>
    </button>
    <button
      v-for="item in categories"
      :key="item.id"
      type="button"
      :aria-pressed="category === item.id"
      @click="emit('change', item.id)"
    >
      <span>{{ item.name }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.catalog-category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-4);

  button {
    min-width: 0;
    padding: 18px 28px;
    border: 1px solid var(--catalog-border);
    border-radius: 6px;
    background: var(--ic-color-background-container);
    color: var(--catalog-text);
    font-family: inherit;
    font-size: 18px;
    font-weight: 400;
    line-height: 26px;
    overflow-wrap: anywhere;
    cursor: pointer;
  }

  button[aria-pressed='true'] {
    border-color: var(--catalog-primary);
    background: var(--ic-color-academy-tint);
    color: var(--catalog-primary);
    font-weight: 600;
  }

  button:focus-visible {
    outline: 2px solid var(--catalog-primary);
    outline-offset: 4px;
  }
}

@media (max-width: 767px) {
  .catalog-category-tabs {
    gap: var(--ic-spacing-2);

    button {
      padding: 12px 16px;
      font-size: 14px;
      line-height: 22px;
    }
  }
}
</style>
