<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import HomeSectionTitle from './HomeSectionTitle.vue'

const props = defineProps<{
  categories: { id: string; name: string }[]
  category: string
  items: WebContentCard[]
  levels: { id: string; name: string }[]
  level: string
  levelItems: WebContentCard[]
}>()
const emit = defineEmits<{ select: [id: string]; level: [id: string] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const visible = computed(() => (props.level ? props.levelItems : props.items).slice(0, 8))

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
function setLevel(event: Event) {
  emit('level', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <section class="home-resources">
    <div class="container-page">
      <HomeSectionTitle
        :title="t('home.resourcesTitle')"
        :subtitle="t('home.resourcesSubtitle')"
        :more="t('home.moreResources')"
        :to="localePath('/resources')"
      />
      <div class="home-resources__filters">
        <div role="group" :aria-label="t('catalog.category')">
          <button
            v-for="item in categories"
            :key="item.id"
            type="button"
            :class="{ 'is-active': !level && item.id === category }"
            :aria-pressed="!level && item.id === category"
            @click="emit('select', item.id)"
          >
            {{ item.name }}
          </button>
        </div>
        <label>
          <span class="sr-only">{{ t('catalog.level') }}</span>
          <select :value="level" @change="setLevel">
            <option value="">{{ t('home.allLevels') }}</option>
            <option v-for="item in levels" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </label>
      </div>
      <ul>
        <li v-for="item in visible" :key="item.contentKey">
          <NuxtLink :to="localePath(webContentPath(item))">
            <span class="home-resources__cover">
              <img
                v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                :src="apiUrl(item.coverUrl)"
                alt=""
              />
            </span>
            <span class="home-resources__body">
              <em>{{ kind(item) }}</em>
              <strong>{{ item.title }}</strong>
              <small v-if="item.categoryName">{{
                t('home.suitable', { name: item.categoryName })
              }}</small>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.home-resources {
  padding: 48px 0;
  background: #fbfdff;
}

.home-resources__filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.home-resources__filters div {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.home-resources__filters button,
.home-resources__filters select {
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: #fff;
  color: #1c1f23;
  font-size: 14px;
}

.home-resources__filters .is-active {
  background: #eaf5ff;
  color: #0077fa;
}

.home-resources ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin: 24px 0 0;
  list-style: none;
}

.home-resources a {
  display: block;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  color: #1c1f23;
}

.home-resources__cover {
  display: block;
  height: 158px;
  background: #dce7f5;
}

.home-resources__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-resources__body {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.home-resources em {
  justify-self: start;
  padding: 2px 6px;
  border-radius: 4px;
  background: #eaf5ff;
  color: #0077fa;
  font-size: 12px;
  font-style: normal;
}

.home-resources strong {
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}

.home-resources small {
  color: #68788c;
  font-size: 12px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 960px) {
  .home-resources ul {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .home-resources__filters,
  .home-resources ul {
    display: grid;
  }

  .home-resources ul {
    grid-template-columns: 1fr;
  }
}
</style>
