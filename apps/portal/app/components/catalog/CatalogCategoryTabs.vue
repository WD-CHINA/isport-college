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
      <span
        class="catalog-category-tabs__icon catalog-category-tabs__icon--all"
        aria-hidden="true"
      />
      <span>{{ t('catalog.allCases') }}</span>
    </button>
    <button
      v-for="item in categories"
      :key="item.id"
      type="button"
      :aria-pressed="category === item.id"
      @click="emit('change', item.id)"
    >
      <span
        class="catalog-category-tabs__icon"
        :class="`catalog-category-tabs__icon--${item.id.toLowerCase()}`"
        aria-hidden="true"
      />
      <span>{{ item.name }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.catalog-category-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-width: 0;
    min-height: 76px;
    padding: 24px;
    border: 0;
    border-radius: 10px;
    background: var(--ic-color-background-container, #fff);
    color: var(--catalog-text);
    box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
    font-family: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 28px;
    text-align: start;
    cursor: pointer;
    transition:
      color var(--ic-motion-duration-fast, 150ms),
      box-shadow var(--ic-motion-duration-fast, 150ms);
  }

  button > span:last-child {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  button:hover {
    color: var(--catalog-primary);
    box-shadow:
      inset 0 0 0 1px var(--catalog-primary),
      0 4px 12px rgb(0 0 0 / 4%);

    .catalog-category-tabs__icon {
      opacity: 1;
    }
  }

  button[aria-pressed='true'] {
    color: var(--catalog-primary);
    box-shadow:
      inset 0 0 0 2px var(--catalog-primary),
      0 4px 12px rgb(0 0 0 / 4%);

    .catalog-category-tabs__icon {
      opacity: 1;
    }
  }

  button:focus-visible {
    outline: 2px solid var(--catalog-primary);
    outline-offset: 4px;
  }

  &__icon {
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    background: currentcolor;
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;

    // 教研 SVG 共用不透明遮罩，透明度由交互状态控制。
    &--series,
    &--research,
    &--topics,
    &--products {
      opacity: 0.8;
    }

    &--all {
      mask-image: url('/catalog/ardot/school-all.svg');
    }

    &--series {
      mask-image: url('/catalog/ardot/research-practice.svg');
    }

    &--research {
      mask-image: url('/catalog/ardot/research-development.svg');
    }

    &--topics {
      mask-image: url('/catalog/ardot/research-events.svg');
    }

    &--products {
      mask-image: url('/catalog/ardot/research-tutorials.svg');
    }

    &--curriculum {
      mask-image: url('/catalog/ardot/school-curriculum.svg');
    }

    &--digital {
      mask-image: url('/catalog/ardot/school-digital.svg');
    }
  }
}

@media (max-width: 1023px) {
  .catalog-category-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

@media (max-width: 767px) {
  .catalog-category-tabs {
    button {
      gap: 8px;
      min-height: 64px;
      padding: 16px 12px;
      font-size: 14px;
      line-height: 22px;
    }

    &__icon {
      width: 24px;
      height: 24px;
      flex-basis: 24px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-category-tabs {
    button {
      transition: none;
    }
  }
}
</style>
