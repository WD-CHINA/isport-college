<script setup lang="ts">
import type { WebListQuery, WebResourceFilters } from '@isport/shared'
import { Button as AButton, Input as AInput, Select as ASelect } from 'antdv-next'

const props = defineProps<{
  channel: 'resource' | 'research' | 'school'
  categories: { id: string; name: string }[]
  resourceFilters?: WebResourceFilters | null
}>()
const model = defineModel<WebListQuery>({ required: true })
const { t } = useI18n()
const keyword = shallowRef(model.value.keyword ?? '')
watch(
  () => model.value.keyword,
  value => {
    keyword.value = value ?? ''
  },
)
const resource = computed(() => props.channel === 'resource')
const secondCategories = computed(() =>
  (props.resourceFilters?.secondCategoryList ?? []).filter(
    item => item.parentId === model.value.category,
  ),
)
const fields = computed(() => {
  const filters = props.resourceFilters
  if (!resource.value || !filters) return []
  const definitions = [
    { key: 'secondCategoryId', label: 'category', items: secondCategories.value },
    { key: 'recommendedLevel', label: 'level', items: filters.levelList },
    { key: 'resourceType', label: 'kind', items: filters.typeList },
    { key: 'bodyPartTagId', label: 'bodyPart', items: filters.bodyPartList },
  ] as const
  return definitions
    .filter(field => field.items.length)
    .map(field => ({
      key: field.key,
      label: t(`catalog.${field.label}`),
      options: [
        { value: '', label: t('common.all') },
        ...field.items.map(item => ({ value: item.id, label: item.name })),
      ],
    }))
})
function set(field: Exclude<keyof WebListQuery, 'page'>, value: unknown) {
  const text = typeof value === 'string' ? value : ''
  const next: WebListQuery = { ...model.value, [field]: text || undefined, page: 1 }
  if (field === 'category') next.secondCategoryId = undefined
  model.value = next
}
function reset() {
  keyword.value = ''
  model.value = { page: 1 }
}
</script>

<template>
  <section class="content-filters" :aria-label="t('catalog.filters')">
    <form class="content-filters__search" @submit.prevent="set('keyword', keyword)">
      <AInput
        v-model:value="keyword"
        allow-clear
        :maxlength="100"
        :aria-label="t('catalog.search')"
        :placeholder="t('catalog.search')"
        @change="!keyword && set('keyword', '')"
      />
      <AButton type="primary" html-type="submit">{{ t('common.search') }}</AButton>
      <AButton @click="reset">{{ t('common.reset') }}</AButton>
    </form>
    <div class="content-filters__categories" role="group" :aria-label="t('catalog.category')">
      <AButton
        :type="!model.category ? 'primary' : 'default'"
        :aria-pressed="!model.category"
        @click="set('category', '')"
        >{{ t('common.all') }}</AButton
      >
      <AButton
        v-for="item in categories"
        :key="item.id"
        :type="model.category === item.id ? 'primary' : 'default'"
        :aria-pressed="model.category === item.id"
        @click="set('category', item.id)"
        >{{ item.name }}</AButton
      >
    </div>
    <div v-if="fields.length" class="content-filters__fields">
      <label v-for="field in fields" :key="field.key" class="content-filters__field">
        <span>{{ field.label }}</span>
        <ASelect
          :value="model[field.key] ?? ''"
          :options="field.options"
          :aria-label="field.label"
          @change="value => set(field.key, value)"
        />
      </label>
    </div>
  </section>
</template>

<style scoped>
.content-filters {
  display: grid;
  gap: 24px;
  padding: 24px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-xl, 14px);
  background: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));
}

.content-filters__search {
  display: flex;
  gap: 10px;
}

.content-filters__search > :first-child {
  min-width: 0;
}

.content-filters__categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.content-filters__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.content-filters__field {
  display: grid;
  gap: 8px;
  font-size: 14px;
}

@media (max-width: 480px) {
  .content-filters {
    padding: 16px;
  }

  .content-filters__fields {
    grid-template-columns: 1fr;
  }
}
</style>
