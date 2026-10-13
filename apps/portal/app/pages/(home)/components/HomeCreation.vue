<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import HomeSectionTitle from './HomeSectionTitle.vue'

const props = defineProps<{ items: WebContentCard[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const featured = computed(() => props.items[0])
const hot = computed(() => props.items.slice(1, 6))
const cover = computed(() => (featured.value ? apiUrl(featured.value.coverUrl) : ''))
</script>

<template>
  <section class="home-creation">
    <div class="container-page">
      <div class="home-creation__head">
        <HomeSectionTitle :title="t('home.creationTitle')" :subtitle="t('home.creationSubtitle')" />
        <div class="home-creation__entry" :title="t('academy.unavailable')">
          <strong>{{ t('home.enterCreation') }}</strong>
          <span>{{ t('home.creationHint') }} ›</span>
        </div>
      </div>
      <div v-if="featured" class="home-creation__layout">
        <article>
          <span class="home-creation__cover">
            <img v-if="isContentAssetUrl(cover)" :src="cover" alt="" />
          </span>
          <div>
            <em v-if="featured.categoryName">{{ featured.categoryName }}</em>
            <h3>{{ featured.title }}</h3>
            <p>{{ featured.summary }}</p>
            <small v-if="featured.authorName">{{ featured.authorName }}</small>
            <NuxtLink :to="localePath(webContentPath(featured))"
              >{{ t('home.viewWork') }} ›</NuxtLink
            >
          </div>
        </article>
        <aside>
          <div>
            <h3>{{ t('home.hotTitle') }}</h3>
            <NuxtLink :to="localePath('/schools')">{{ t('home.viewAll') }} ›</NuxtLink>
          </div>
          <ul>
            <li v-for="item in hot" :key="item.contentKey">
              <NuxtLink :to="localePath(webContentPath(item))">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-creation {
  padding: 48px 0;
  background: #f4f7fb;
}

.home-creation__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 306px;
  gap: 36px;
  align-items: start;
}

.home-creation__entry {
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(90deg, #0077fa, #4f9dff);
  color: #fff;
}

.home-creation__entry strong,
.home-creation__entry span {
  display: block;
}

.home-creation__entry strong {
  font-size: 18px;
}

.home-creation__entry span {
  margin-top: 8px;
  font-size: 13px;
}

.home-creation__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  margin-top: 24px;
}

.home-creation article,
.home-creation aside {
  border-radius: 12px;
  background: #fff;
}

.home-creation article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  padding: 24px;
}

.home-creation__cover {
  min-height: 220px;
  border-radius: 8px;
  background: #dce7f5;
}

.home-creation__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.home-creation em {
  color: #0077fa;
  font-size: 12px;
  font-style: normal;
}

.home-creation h3 {
  margin: 12px 0 0;
  color: #1c1f23;
  font-size: 22px;
  font-weight: 600;
  line-height: 32px;
}

.home-creation p,
.home-creation small {
  color: #68788c;
  font-size: 14px;
}

.home-creation article a {
  display: inline-block;
  margin-top: 16px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #eaf5ff;
  color: #0077fa;
}

.home-creation aside {
  padding: 24px;
}

.home-creation aside > div {
  display: flex;
  justify-content: space-between;
}

.home-creation aside h3 {
  margin: 0;
  font-size: 20px;
}

.home-creation aside > div a {
  color: #0077fa;
}

.home-creation ul {
  display: grid;
  gap: 16px;
  margin: 16px 0 0;
  list-style: none;
}

.home-creation li a {
  color: #1c1f23;
}

@media (max-width: 960px) {
  .home-creation__head,
  .home-creation__layout,
  .home-creation article {
    grid-template-columns: 1fr;
  }
}
</style>
