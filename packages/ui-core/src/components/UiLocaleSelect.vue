<script setup lang="ts">
export interface LocaleOption {
  value: string
  label: string
}

interface Props {
  options: LocaleOption[]
  /** 无障碍标签（用于 sr-only 与 select 的 aria-label）*/
  label: string
}

defineProps<Props>()

/** 当前语言值，通过 v-model 双向绑定 */
const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="ui-locale-select">
    <span class="sr-only">{{ label }}</span>
    <svg
      class="ui-locale-select__icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M2 10h16M10 2c2.2 2.3 3.4 5 3.4 8s-1.2 5.7-3.4 8c-2.2-2.3-3.4-5-3.4-8S7.8 4.3 10 2Z"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>
    <select v-model="model" class="ui-locale-select__native" :aria-label="label">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.ui-locale-select {
  display: inline-flex;
  align-items: center;
  gap: var(--ic-spacing-1, 4px);
  min-height: 44px;
  color: var(--ic-color-text-secondary, #475569);
  cursor: pointer;
}

.ui-locale-select__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.ui-locale-select__native {
  border: none;
  background: transparent;
  font-size: var(--ic-font-size-sm, 14px);
  color: inherit;
  cursor: pointer;
  outline: none;
}
</style>
