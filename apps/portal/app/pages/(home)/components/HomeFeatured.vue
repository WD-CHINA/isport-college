<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import ContentTypeIcon from '~/components/content/ContentTypeIcon.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
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

const hotIcons = {
  VIDEO: 'faa76.svg',
  AUDIO: '5b8fd.svg',
  DOCUMENT: '45ed2.svg',
  IMAGE: 'e2df2.svg',
  LINK: '4f72c.svg',
  ARTICLE: '4f72c.svg',
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
              >{{ t('home.viewContent') }} <img src="/home/figma/ec1cf.svg" alt=""
            /></NuxtLink>
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
            <NuxtLink :to="localePath('/resources')"
              >{{ t('home.viewAll') }} <img src="/home/figma/21c16.svg" alt=""
            /></NuxtLink>
          </div>
          <ul>
            <li v-for="(item, row) in hot.slice(0, 5)" :key="item.contentKey">
              <NuxtLink :to="localePath(webContentPath(item))">
                <img
                  v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                  :src="apiUrl(item.coverUrl)"
                  alt=""
                />
                <span v-else class="home-featured__thumb">
                  <ContentTypeIcon :type="item.detailType" :size="24" />
                </span>
                <span class="home-featured__hot-copy">
                  <strong>{{ item.title }}</strong>
                  <em v-if="item.categoryName"
                    ><img :src="`/home/figma/${hotIcons[item.detailType]}`" alt="" />{{
                      item.categoryName
                    }}</em
                  >
                </span>
                <img
                  class="home-featured__arrow"
                  :src="`/home/figma/${row === 0 ? '49d2c.svg' : 'dd1b3.svg'}`"
                  alt=""
                />
              </NuxtLink>
            </li>
          </ul>
          <AppEmpty v-if="!hot.length" :description="t('common.empty')" />
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
  box-shadow: inset 0 0 0 1px var(--home-color-border);
  background: #fff;
}

.home-featured__spotlight {
  display: grid;
  align-content: start;
  grid-template-columns: minmax(0, 400fr) minmax(0, 344fr);
  gap: 24px;
  min-height: 409px;
  padding: 24px;
}

.home-featured__cover,
.home-featured__thumb {
  border-radius: 8px;
  background: #dce7f5;
}

.home-featured__cover {
  overflow: hidden;
  height: 320px;
}

.home-featured__cover img,
.home-featured__hot li > a > img:not(.home-featured__arrow) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-featured__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  min-height: 320px;
  padding-block: 16px;
}

.home-featured__tag {
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
  line-height: 38px;
}

.home-featured__copy p {
  margin: 0;
  color: #68788c;
  font-size: 14px;
  line-height: 24px;
}

.home-featured__hot em {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 1px 4px;
  border: 0.5px solid #2cb8c5;
  border-radius: 3px;
  color: #05a4b6;
  font-size: 12px;
  font-style: normal;
  line-height: 16px;
}

.home-featured__hot em img {
  display: block;
  flex: none;
}

.home-featured__hot-head a {
  color: #0077fa;
  font-size: 14px;
  font-weight: 500;
}

.home-featured__copy a {
  height: 32px;
  border: 0;
  color: var(--home-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  padding: 6px 12px;
  border-radius: 6px;
  background: #eaf5ff;
}

.home-featured__dots {
  display: flex;
  grid-column: 1 / -1;
  justify-content: center;
  gap: 12px;
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
  margin-bottom: 24px;
}

.home-featured__hot h3 {
  font-size: 20px;
  font-weight: 600;
}

.home-featured__hot ul {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-featured__hot a {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1c1f23;
}

.home-featured__hot li > a > img:not(.home-featured__arrow),
.home-featured__thumb {
  width: 66px;
  height: 48px;
  flex: none;
}

.home-featured__thumb {
  display: grid;
  place-items: center;
}

.home-featured__hot-copy {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 6px;
}

.home-featured__hot strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-featured__hot-head a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: rgb(28 31 35 / 80%);
}

.home-featured__hot h3 {
  line-height: 32px;
}

.home-featured__hot .home-featured__arrow {
  width: auto;
  height: auto;
}

.home-featured__copy a img,
.home-featured__hot-head img {
  display: block;
  flex: none;
}

.home-featured__tag {
  background: rgb(0 149 238 / 15%);
  color: #004b83;
}

@media (max-width: 960px) {
  .home-featured__layout,
  .home-featured__spotlight {
    grid-template-columns: 1fr;
  }
}
</style>
