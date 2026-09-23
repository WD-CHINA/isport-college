<script setup lang="ts">
import type { AcademyContent, Taxonomy } from '@isport/shared'
import { Button as AButton } from 'antdv-next'

const props = defineProps<{
  title: string
  items: AcademyContent[]
  to: string
  categories?: Taxonomy[]
  category?: string
}>()
const emit = defineEmits<{ select: [category: string] }>()
const { t } = useI18n()
const localize = useLocalizedText()
const localePath = useLocalePath()
const more = computed(() =>
  localePath({ path: props.to, query: props.category ? { category: props.category } : {} }),
)
</script>

<template>
  <section class="home-content-section">
    <div class="home-content-section__heading">
      <h2>{{ title }}</h2>
      <NuxtLink :to="more">{{ t('common.viewMore') }} →</NuxtLink>
    </div>
    <div
      v-if="categories?.length"
      class="home-content-section__tabs"
      role="group"
      :aria-label="title"
    >
      <AButton
        v-for="item in categories"
        :key="item.id"
        :type="category === item.id ? 'primary' : 'default'"
        :aria-pressed="category === item.id"
        @click="emit('select', item.id)"
        >{{ localize(item.label) }}</AButton
      >
    </div>
    <ContentGrid :items="items" />
  </section>
</template>

<style scoped>
.home-content-section {
  display: grid;
  gap: 20px;
}

.home-content-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.home-content-section__heading h2 {
  margin: 0;
  font-size: 24px;
}

.home-content-section__heading a {
  flex-shrink: 0;
  color: #2563eb;
}

.home-content-section__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
