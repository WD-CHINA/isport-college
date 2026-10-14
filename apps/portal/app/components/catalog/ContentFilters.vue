<script setup lang="ts">
import type { WebListQuery, WebResourceFilters } from '@isport/shared'
import CatalogCategoryTabs from './CatalogCategoryTabs.vue'

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
const chipFields = computed(() => {
  if (!resource.value || !props.resourceFilters) return []
  return [
    {
      key: 'secondCategoryId' as const,
      label: t('catalog.secondCategory'),
      items: secondCategories.value,
    },
    {
      key: 'bodyPartTagId' as const,
      label: t('catalog.bodyPart'),
      items: model.value.category === '1' ? props.resourceFilters.bodyPartList : [],
    },
  ].filter(field => field.items.length)
})
const selectFields = computed(() => {
  if (!resource.value || !props.resourceFilters) return []
  return [
    {
      key: 'recommendedLevel' as const,
      label: t('catalog.level'),
      items: props.resourceFilters.levelList,
    },
    {
      key: 'resourceType' as const,
      label: t('catalog.kind'),
      items: props.resourceFilters.typeList,
    },
  ]
    .filter(field => field.items.length)
    .map(field => ({
      ...field,
      options: [
        { value: '', label: t('common.all') },
        ...field.items.map(item => ({ value: item.id, label: item.name })),
      ],
    }))
})
function set(field: Exclude<keyof WebListQuery, 'page'>, value: unknown) {
  const text = typeof value === 'string' ? value : ''
  const next: WebListQuery = { ...model.value, [field]: text || undefined, page: 1 }
  if (field === 'category') {
    next.secondCategoryId = undefined
    next.bodyPartTagId = undefined
  }
  model.value = next
}
function reset() {
  keyword.value = ''
  model.value = {
    page: 1,
    category: props.channel !== 'school' ? model.value.category : undefined,
  }
}
</script>

<template>
  <section
    class="content-filters"
    :class="resource ? 'content-filters--resource' : 'content-filters--editorial'"
    :aria-label="t('catalog.filters')"
  >
    <CatalogCategoryTabs
      v-if="!resource"
      :channel="channel === 'school' ? 'school' : 'research'"
      :categories="categories"
      :category="model.category"
      @change="value => set('category', value)"
    />
    <div
      v-else
      class="content-filters__categories"
      role="group"
      :aria-label="t('catalog.category')"
    >
      <button
        v-for="item in categories"
        :key="item.id"
        type="button"
        :aria-pressed="model.category === item.id"
        @click="set('category', item.id)"
      >
        {{ item.name }}
      </button>
    </div>
    <details v-if="!resource" class="content-filters__search-toggle" :open="!!model.keyword">
      <summary>{{ t('common.search') }}</summary>
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
    </details>
    <div
      v-for="field in chipFields"
      :key="field.key"
      class="content-filters__chips"
      role="group"
      :aria-label="field.label"
    >
      <span class="content-filters__label">{{ field.label }}</span>
      <button type="button" :aria-pressed="!model[field.key]" @click="set(field.key, '')">
        {{ t('common.all') }}
      </button>
      <button
        v-for="item in field.items"
        :key="item.id"
        type="button"
        :aria-pressed="model[field.key] === item.id"
        @click="set(field.key, item.id)"
      >
        {{ item.name }}
      </button>
    </div>
    <div v-if="resource" class="content-filters__fields">
      <label v-for="field in selectFields" :key="field.key" class="content-filters__field">
        <span class="content-filters__label">{{ field.label }}</span>
        <ASelect
          :value="model[field.key] ?? ''"
          :options="field.options"
          :aria-label="field.label"
          @change="value => set(field.key, value)"
        />
      </label>
      <button class="content-filters__reset" type="button" @click="reset">
        {{ t('catalog.resetFilters') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.content-filters {
  min-width: 0;
}

.content-filters--editorial {
  position: relative;
}

.content-filters--resource {
  padding: 0 26px 20px;
  border-radius: 12px;
  background: #fff;
  box-shadow: inset 0 0 0 1px var(--catalog-border);
}

.content-filters button {
  border: 0;
  background: transparent;
  color: var(--catalog-text);
  cursor: pointer;
}

.content-filters button[aria-pressed='true'] {
  color: var(--catalog-primary);
}

.content-filters__categories {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.content-filters__categories > button {
  min-height: 56px;
  padding: 18px 28px;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  box-shadow: inset 0 0 0 1px var(--catalog-border);
}

.content-filters__categories > button[aria-pressed='true'] {
  background: #eaf5ff;
  box-shadow: inset 0 0 0 1px var(--catalog-primary);
}

.content-filters--resource .content-filters__categories {
  gap: 40px;
  min-height: 66px;
  border-bottom: 1px solid var(--catalog-border);
}

.content-filters--resource .content-filters__categories > button {
  padding: 0 10px;
  border-radius: 0;
  font-size: 16px;
  font-weight: 600;
  box-shadow: none;
}

.content-filters--resource .content-filters__categories > button[aria-pressed='true'] {
  background: transparent;
  box-shadow: inset 0 -3px var(--catalog-primary);
}

.content-filters__chips {
  display: flex;
  min-height: 42px;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.content-filters__categories + .content-filters__chips {
  margin-top: 15px;
}

.content-filters__chips button {
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 12px;
}

.content-filters__chips button[aria-pressed='true'] {
  background: #eaf5ff;
}

.content-filters__label {
  color: var(--catalog-muted);
  font-size: 12px;
  width: 66px;
  flex: none;
}

.content-filters__chips > .content-filters__label {
  width: 66px;
  flex: none;
}

.content-filters__fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 26px;
  padding-top: 9px;
}

.content-filters__field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-filters__field :deep(.ant-select) {
  min-width: 115px;
}

.content-filters__reset {
  margin-left: auto;
  font-size: 12px;
  color: var(--catalog-muted) !important;
}

.content-filters__search-toggle {
  position: absolute;
  top: calc(100% + 32px);
  right: 0;
  z-index: 1;
  max-width: 100%;
  color: var(--catalog-muted);
  font-size: 14px;
}

.content-filters__search-toggle summary {
  width: fit-content;
  margin-inline-start: auto;
  padding: 2px 0 8px;
  cursor: pointer;
}

.content-filters__search {
  display: flex;
  max-width: 100%;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  border: 1px solid var(--catalog-border);
  border-radius: 8px;
  background: #fff;
  box-shadow: var(--ic-box-shadow-md);
}

.content-filters__search > :first-child {
  min-width: 0;
}

@media (max-width: 767px) {
  .content-filters--resource {
    padding: 0 16px 20px;
  }

  .content-filters__categories {
    gap: 10px;
  }

  .content-filters__categories > button {
    min-height: 44px;
    padding: 12px 16px;
  }

  .content-filters--resource .content-filters__categories {
    gap: 12px;
  }

  .content-filters--resource .content-filters__categories > button {
    min-height: 52px;
    font-size: 14px;
  }

  .content-filters__chips {
    padding-top: 12px;
  }

  .content-filters__chips > .content-filters__label {
    width: 100%;
  }

  .content-filters__search-toggle {
    width: 100%;
    margin-left: 0;
  }

  .content-filters__field {
    min-width: 0;
    flex-wrap: wrap;
  }
}
</style>
