<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import HomeSectionTitle from './HomeSectionTitle.vue'

const props = defineProps<{ featured: WebContentCard[]; hot: WebContentCard[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const index = shallowRef(0)
const current = computed(() => props.featured[index.value])
const cover = computed(() => (current.value ? apiUrl(current.value.coverUrl) : ''))

watch(
  () => props.featured.length,
  () => {
    index.value = 0
  },
)

function kind(item: WebContentCard) {
  const kinds = {
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'courseware',
    IMAGE: 'image',
    LINK: 'link',
    ARTICLE: 'article',
  } as const
  return t(`catalog.media.${kinds[item.detailType]}`)
}
</script>

<template>
  <section class="home-featured">
    <div class="container-page">
      <HomeSectionTitle :title="t('home.featuredTitle')" :subtitle="t('home.featuredSubtitle')" />
      <div class="home-featured__layout">
        <article v-if="current" class="home-featured__spotlight">
          <div class="home-featured__cover">
            <img v-if="isContentAssetUrl(cover)" :src="cover" alt="" />
          </div>
          <div class="home-featured__copy">
            <span v-if="current.categoryName" class="home-featured__tag">{{
              current.categoryName
            }}</span>
            <h3>{{ current.title }}</h3>
            <p>{{ current.summary }}</p>
            <NuxtLink :to="localePath(webContentPath(current))"
              >{{ t('home.viewContent') }} ›</NuxtLink
            >
          </div>
          <div v-if="featured.length > 1" class="home-featured__dots">
            <button
              v-for="(item, dot) in featured"
              :key="item.contentKey"
              type="button"
              :class="{ 'is-active': dot === index }"
              :aria-label="item.title"
              @click="index = dot"
            />
          </div>
        </article>
        <aside class="home-featured__hot">
          <div class="home-featured__hot-head">
            <h3>{{ t('home.hotTitle') }}</h3>
            <NuxtLink :to="localePath('/resources')">{{ t('home.viewAll') }} ›</NuxtLink>
          </div>
          <ul>
            <li v-for="item in hot.slice(0, 5)" :key="item.contentKey">
              <NuxtLink :to="localePath(webContentPath(item))">
                <img
                  v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                  :src="apiUrl(item.coverUrl)"
                  alt=""
                />
                <span v-else class="home-featured__thumb" />
                <span class="home-featured__hot-copy">
                  <strong>{{ item.title }}</strong>
                  <em v-if="item.categoryName">{{ kind(item) }} · {{ item.categoryName }}</em>
                </span>
                <span aria-hidden="true">›</span>
              </NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-featured {
  padding: 48px 0;
  background: #fbfdff;
}

.home-featured__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  margin-top: 16px;
}

.home-featured__spotlight,
.home-featured__hot {
  border-radius: 12px;
  background: #fff;
}

.home-featured__spotlight {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  min-height: 320px;
  padding: 24px;
}

.home-featured__cover,
.home-featured__thumb {
  border-radius: 8px;
  background: #dce7f5;
}

.home-featured__cover {
  overflow: hidden;
  min-height: 240px;
}

.home-featured__cover img,
.home-featured__hot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-featured__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.home-featured__tag,
.home-featured__hot em {
  color: #0077fa;
  font-size: 12px;
  font-style: normal;
}

.home-featured__tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: #eaf5ff;
}

.home-featured__copy h3,
.home-featured__hot h3 {
  margin: 0;
  color: #1c1f23;
}

.home-featured__copy h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 36px;
}

.home-featured__copy p {
  margin: 0;
  color: #68788c;
  font-size: 14px;
  line-height: 22px;
}

.home-featured__copy a,
.home-featured__hot-head a {
  color: #0077fa;
  font-size: 14px;
  font-weight: 500;
}

.home-featured__copy a {
  margin-top: auto;
  padding: 6px 12px;
  border-radius: 6px;
  background: #eaf5ff;
}

.home-featured__dots {
  display: flex;
  grid-column: 1 / -1;
  justify-content: center;
  gap: 8px;
}

.home-featured__dots button {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: #cbe7fe;
}

.home-featured__dots .is-active {
  width: 16px;
  background: #0077fa;
}

.home-featured__hot {
  padding: 24px;
}

.home-featured__hot-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.home-featured__hot h3 {
  font-size: 20px;
  font-weight: 600;
}

.home-featured__hot ul {
  display: grid;
  gap: 16px;
  margin: 0;
  list-style: none;
}

.home-featured__hot a {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1c1f23;
}

.home-featured__hot img,
.home-featured__thumb {
  width: 48px;
  height: 48px;
  flex: none;
}

.home-featured__hot-copy {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 4px;
}

.home-featured__hot strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 960px) {
  .home-featured__layout,
  .home-featured__spotlight {
    grid-template-columns: 1fr;
  }
}
</style>
