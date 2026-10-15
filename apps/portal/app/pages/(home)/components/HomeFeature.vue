<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
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
import HomeSchools from './HomeSchools.vue'
import HomeNews from './HomeNews.vue'
import HomeServiceStats from './HomeServiceStats.vue'
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
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request

function selectResource(id: string) {
  resourceCategory.value = id
  levelCategory.value = ''
}
</script>

<template>
  <div class="academy-home">
    <ContextHolder />
    <HomeHero />
    <HomeCapabilities />
    <HomePartners />
    <div v-if="error" class="container-page academy-home__status">
      <AButton @click="refresh()">{{ t('catalog.retry') }}</AButton>
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
      <HomeCreation />
      <HomeSchools :items="data.schoolList" />
      <HomeNews :items="data.newsList" />
    </template>
    <HomeServiceStats />
  </div>
</template>

<style lang="scss" scoped>
.academy-home {
  --home-color-primary: var(--ic-color-academy-primary);
  --home-color-text: var(--ic-color-academy-text-primary);
  --home-color-muted: var(--ic-color-academy-text-muted);
  --home-color-tint: var(--ic-color-academy-tint);
  --home-color-border: var(--ic-color-academy-border-base);

  background: var(--ic-color-academy-background-page);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  &__status {
    padding: 40px 0;
  }
}

@media (max-width: 767px) {
  .academy-home {
    :deep(.home-featured),
    :deep(.home-resources),
    :deep(.home-research),
    :deep(.home-people),
    :deep(.home-creation),
    :deep(.home-schools),
    :deep(.home-news) {
      padding-block: var(--ic-spacing-8);
    }

    :deep(.home-lingyue) {
      padding-block: var(--ic-spacing-4);
    }
  }
}
</style>
