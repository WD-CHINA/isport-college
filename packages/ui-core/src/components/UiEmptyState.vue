<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="ui-empty-state">
    <svg
      class="ui-empty-state__icon"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        class="ui-empty-state__ring"
        stroke-width="2"
        stroke-dasharray="4 4"
      />
      <path
        d="M17 25.5c2 2.5 4.5 4 7 4s5-1.5 7-4"
        class="ui-empty-state__ring"
        stroke-width="2"
        stroke-linecap="round"
      />
      <circle cx="18" cy="19" r="1.6" class="ui-empty-state__dot" />
      <circle cx="30" cy="19" r="1.6" class="ui-empty-state__dot" />
    </svg>
    <p class="ui-empty-state__title">{{ title }}</p>
    <p v-if="description" class="ui-empty-state__desc">{{ description }}</p>
    <div v-if="$slots.default" class="ui-empty-state__action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ui-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ic-spacing-2, 8px);
  padding: var(--ic-spacing-12, 48px) var(--ic-spacing-4, 16px);
  text-align: center;
}

.ui-empty-state__icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--ic-spacing-2, 8px);
}

.ui-empty-state__ring {
  stroke: var(--ic-color-border-strong, #cbd5e1);
}

.ui-empty-state__dot {
  fill: var(--ic-color-border-strong, #cbd5e1);
}

.ui-empty-state__title {
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-medium, 500);
  color: var(--ic-color-text-secondary, #475569);
}

.ui-empty-state__desc {
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.ui-empty-state__action {
  margin-top: var(--ic-spacing-3, 12px);
}
</style>
