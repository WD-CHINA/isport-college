<script setup lang="ts">
import ContentGrid from '~/components/features/content/ContentGrid.vue'
import HomeContentSection from '~/components/features/home/HomeContentSection.vue'
import HomeHero from '~/components/features/home/HomeHero.vue'
import HomeLearningEntries from '~/components/features/home/HomeLearningEntries.vue'
import HomeNews from '~/components/features/home/HomeNews.vue'
import HomePeople from '~/components/features/home/HomePeople.vue'
import { useAcademyHome } from '~/composables/content/useAcademyHome'

const { t } = useI18n()
const {
  request,
  resourceCategory,
  researchCategory,
  levelCategory,
  resourceCategories,
  researchCategories,
  levelCategories,
  resourceItems,
  researchItems,
  levelItems,
} = useAcademyHome()
const { data, error, status, refresh } = request
await request
</script>

<template>
  <div>
    <HomeHero />
    <div class="container-page academy-home">
      <HomeLearningEntries :levels="levelCategories" />
      <AAlert v-if="error" type="error" :title="t('academy.requestFailed')">
        <template #action
          ><AButton @click="refresh()">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
      <ContentGrid v-else-if="status === 'pending'" :items="[]" loading />
      <template v-else-if="data">
        <HomeContentSection
          :title="t('home.featuredTitle')"
          :items="data.featuredList"
          to="/resources"
        />
        <HomeContentSection :title="t('catalog.popular')" :items="data.hotList" to="/resources" />
        <HomeContentSection
          :title="t('academy.resources')"
          :items="resourceItems"
          to="/resources"
          :categories="resourceCategories"
          :category="resourceCategory"
          @select="resourceCategory = $event"
        />
        <HomeContentSection
          :title="t('home.levels')"
          :items="levelItems"
          to="/resources"
          :categories="levelCategories"
          :category="levelCategory"
          :query="levelCategory ? { recommendedLevel: levelCategory } : {}"
          @select="levelCategory = $event"
        />
        <HomeContentSection
          :title="t('academy.research')"
          :items="researchItems"
          to="/research"
          :categories="researchCategories"
          :category="researchCategory"
          @select="researchCategory = $event"
        />
        <HomeContentSection :title="t('academy.schools')" :items="data.schoolList" to="/schools" />
        <HomePeople :title="t('academy.teachers')" :people="data.teacherList" to="/teachers" />
        <HomeNews :title="t('academy.news')" :items="data.newsList" to="/news" />
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
