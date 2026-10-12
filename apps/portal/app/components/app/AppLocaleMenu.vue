<script setup lang="ts">
import { useLocaleSwitch } from '~/composables/useLocaleSwitch'

const { t } = useI18n()
const { localeModel, localeOptions } = useLocaleSwitch()

const localeMenu = computed(() => ({
  items: localeOptions.value.map(item => ({ key: item.value, label: item.label })),
  selectable: true,
  selectedKeys: [localeModel.value],
}))

const currentLocaleLabel = computed(
  () => localeOptions.value.find(item => item.value === localeModel.value)?.label ?? '',
)

function handleLocaleClick({ key }: { key: string | number }) {
  localeModel.value = String(key)
}
</script>

<template>
  <ADropdown
    :trigger="['click']"
    placement="bottomRight"
    :menu="localeMenu"
    @menu-click="handleLocaleClick"
  >
    <AButton
      type="text"
      class="app-locale-menu"
      :aria-label="`${t('common.language')} ${currentLocaleLabel}`"
    >
      <svg
        class="app-locale-menu__icon"
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
      {{ currentLocaleLabel }}
    </AButton>
  </ADropdown>
</template>

<style scoped>
.app-locale-menu {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: auto;
  padding-inline: 8px;
  color: var(--ic-color-text-secondary, #475569);
}

.app-locale-menu__icon {
  width: 18px;
  height: 18px;
  display: block;
}
</style>
