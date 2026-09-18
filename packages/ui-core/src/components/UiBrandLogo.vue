<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 品牌名称 */
  name: string
  /** 尺寸 */
  size?: 'md' | 'lg'
  /** 深色背景上的反白模式 */
  inverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  inverse: false,
})

const sizeClass = computed(() => ({
  mark: props.size === 'lg' ? 'h-10 w-10' : 'h-8 w-8',
  text: props.size === 'lg' ? 'text-xl' : 'text-lg',
}))

const textClass = computed(() => (props.inverse ? 'text-content-inverse' : 'text-content'))
</script>

<template>
  <span class="ui-brand-logo">
    <svg
      :class="sizeClass.mark"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" class="ui-brand-logo__bg" />
      <path d="M7 21.5 12.5 11l4 7 2.5-3.8L25 21.5H7Z" class="ui-brand-logo__mountain" />
      <circle cx="21.5" cy="10.5" r="2" class="ui-brand-logo__sun" />
    </svg>
    <span class="ui-brand-logo__name" :class="[sizeClass.text, textClass]">{{ name }}</span>
  </span>
</template>

<style scoped>
.ui-brand-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--ic-spacing-2, 8px);
}

.ui-brand-logo__bg {
  fill: var(--ic-color-brand-500, #2563eb);
}

.ui-brand-logo__mountain {
  fill: #fff;
}

.ui-brand-logo__sun {
  fill: var(--ic-color-accent, #f97316);
}

.ui-brand-logo__name {
  font-weight: var(--ic-font-weight-bold, 700);
  letter-spacing: -0.01em;
  white-space: nowrap;
}
</style>
