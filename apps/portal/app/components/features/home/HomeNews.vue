<script setup lang="ts">
import { formatPublishedAt, isContentAssetUrl, type WebNews } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

defineProps<{ title: string; items: WebNews[]; to: string }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
</script>

<template>
  <section class="home-news">
    <div class="home-news__heading">
      <h2>{{ title }}</h2>
      <NuxtLink :to="localePath(to)">{{ t('common.viewMore') }} →</NuxtLink>
    </div>
    <ul v-if="items.length" class="home-news__list">
      <li v-for="item in items" :key="item.id">
        <NuxtLink :to="localePath(`/news/${item.id}`)" class="home-news__card">
          <img
            v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
            :src="apiUrl(item.coverUrl)"
            alt=""
          />
          <strong>{{ item.title }}</strong>
          <span>{{ item.summary }}</span>
          <time v-if="formatPublishedAt(item.publishedAt)">{{
            formatPublishedAt(item.publishedAt)
          }}</time>
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="home-news__empty">{{ t('catalog.noResults') }}</p>
  </section>
</template>

<style scoped>
.home-news {
  display: grid;
  gap: 20px;
}

.home-news__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.home-news__heading h2 {
  margin: 0;
  font-size: 24px;
}

.home-news__heading a {
  color: #2563eb;
}

.home-news__list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-news__card {
  display: grid;
  gap: 6px;
  color: inherit;
}

.home-news__card img {
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
}

.home-news__empty {
  margin: 0;
  color: #64748b;
}
</style>
