<script setup lang="ts">
import {
  BODY_PARTS,
  FITNESS_CATEGORIES,
  RESOURCE_FILTER_KINDS,
  type ContentChannel,
  type ContentQuery,
  type Taxonomy,
} from '@isport/shared'
import { Button as AButton, Input as AInput, Select as ASelect } from 'antdv-next'

const props = defineProps<{ channel: ContentChannel; taxonomies: Taxonomy[] }>()
const model = defineModel<ContentQuery>({ required: true })
const { t } = useI18n()
const localize = useLocalizedText()
const keyword = shallowRef(model.value.keyword ?? '')
watch(
  () => model.value.keyword,
  value => {
    keyword.value = value ?? ''
  },
)
const categories = computed(() => props.taxonomies.filter(item => item.channel === props.channel))
const resource = computed(() => props.channel === 'resource')
const fields = computed(() => {
  if (!resource.value) return []
  const all = { value: '', label: t('common.all') }
  const result = [
    {
      key: 'level' as const,
      label: t('catalog.level'),
      options: [
        all,
        ...[1, 2, 3, 4, 5].map(value => ({
          value: String(value),
          label: t('catalog.levelValue', { level: value }),
        })),
      ],
    },
    {
      key: 'kind' as const,
      label: t('catalog.kind'),
      options: [
        all,
        ...RESOURCE_FILTER_KINDS.map(value => ({ value, label: t(`catalog.media.${value}`) })),
      ],
    },
  ]
  if (model.value.category !== 'fitness') return result
  return [
    ...result,
    {
      key: 'fitness' as const,
      label: t('catalog.fitness'),
      options: [
        all,
        ...FITNESS_CATEGORIES.map(value => ({
          value,
          label: t(`catalog.fitnessOptions.${value}`),
        })),
      ],
    },
    {
      key: 'bodyPart' as const,
      label: t('catalog.bodyPart'),
      options: [
        all,
        ...BODY_PARTS.map(value => ({ value, label: t(`catalog.bodyOptions.${value}`) })),
      ],
    },
  ]
})
function set(field: string, value: unknown) {
  model.value = { ...model.value, [field]: value, page: 1 }
}
function reset() {
  keyword.value = ''
  model.value = { channel: props.channel, category: model.value.category, page: 1 }
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
        v-if="!resource"
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
        >{{ localize(item.label) }}</AButton
      >
    </div>
    <div v-if="fields.length" class="content-filters__fields">
      <label v-for="field in fields" :key="field.key" class="content-filters__field">
        <span>{{ field.label }}</span>
        <ASelect
          :value="String(model[field.key] ?? '')"
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
