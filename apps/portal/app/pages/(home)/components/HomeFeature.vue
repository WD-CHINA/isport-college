<script setup lang="ts">
import ContentGrid from '~/components/content/ContentGrid.vue'
import HomeCapabilities from './HomeCapabilities.vue'
import HomeCreation from './HomeCreation.vue'
import HomeFeatured from './HomeFeatured.vue'
import HomeHero from './HomeHero.vue'
import HomeLingyue from './HomeLingyue.vue'
import HomePartners from './HomePartners.vue'
import HomePeople from './HomePeople.vue'
import HomeResearch from './HomeResearch.vue'
import HomeResources from './HomeResources.vue'
import { useAcademyHome } from '../composables/useAcademyHome'

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

function selectResource(id: string) {
  resourceCategory.value = id
  levelCategory.value = ''
}
</script>

<template>
  <div class="academy-home">
    <HomeHero />
    <HomePartners />
    <HomeCapabilities />
    <div v-if="error" class="container-page academy-home__status">
      <AAlert type="error" :title="t('academy.requestFailed')">
        <template #action
          ><AButton @click="refresh()">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
    </div>
    <div v-else-if="status === 'pending'" class="container-page academy-home__status">
      <ContentGrid :items="[]" loading />
    </div>
    <template v-else-if="data">
      <HomeFeatured :featured="data.featuredList" :hot="data.hotList" />
    </template>
    <HomeLingyue />
    <template v-if="data">
      <HomeResources
        :categories="resourceCategories"
        :category="resourceCategory"
        :items="resourceItems"
        :levels="levelCategories"
        :level="levelCategory"
        :level-items="levelItems"
        @select="selectResource"
        @level="levelCategory = $event"
      />
      <HomeResearch
        :categories="researchCategories"
        :category="researchCategory"
        :items="researchItems"
        @select="researchCategory = $event"
      />
      <HomePeople :people="data.teacherList" />
      <HomeCreation :items="data.schoolList" />
    </template>
  </div>
</template>

<style scoped>
.academy-home {
  background: #fbfdff;
}

.academy-home__status {
  padding: 40px 0;
}
</style>
