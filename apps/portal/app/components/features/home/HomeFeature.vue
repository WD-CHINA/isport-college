<script setup lang="ts">
import { Alert as AAlert, Button as AButton } from 'antdv-next'

const { t } = useI18n()
const { request, resourceCategory, researchCategory, resourceCategories, researchCategories } =
  useAcademyHome()
const { data, error, status, refresh } = request
await request
</script>

<template>
  <div>
    <HomeHero />
    <div class="container-page academy-home">
      <HomeLearningEntries />
      <AAlert v-if="error" type="error" :title="t('academy.requestFailed')">
        <template #action
          ><AButton @click="refresh()">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
      <ContentGrid v-else-if="status === 'pending'" :items="[]" loading />
      <template v-else-if="data">
        <HomeContentSection
          :title="t('home.featuredTitle')"
          :items="data.featured"
          to="/resources"
        />
        <HomeContentSection :title="t('catalog.popular')" :items="data.popular" to="/resources" />
        <HomeContentSection
          :title="t('academy.resources')"
          :items="data.resources[resourceCategory] ?? []"
          to="/resources"
          :categories="resourceCategories"
          :category="resourceCategory"
          @select="resourceCategory = $event"
        />
        <HomeContentSection
          :title="t('academy.research')"
          :items="data.research[researchCategory] ?? []"
          to="/research"
          :categories="researchCategories"
          :category="researchCategory"
          @select="researchCategory = $event"
        />
        <HomeContentSection :title="t('academy.schools')" :items="data.schools" to="/schools" />
        <HomeContentSection
          v-if="data.coCreated.length"
          :title="t('catalog.coCreated')"
          :items="data.coCreated"
          to="/admin/creation"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.academy-home {
  display: grid;
  gap: 48px;
  padding-top: 40px;
}
</style>
