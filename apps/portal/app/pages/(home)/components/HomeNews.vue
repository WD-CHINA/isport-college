<script setup lang="ts">
import { isContentAssetUrl, type WebNews } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import AppEmpty from '~/components/app/AppEmpty.vue'
import HomeSectionTitle from './HomeSectionTitle.vue'
const props = defineProps<{ items: WebNews[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const page = shallowRef(0)
const pages = computed(() => Math.ceil(props.items.length / 2))
const visible = computed(() => props.items.slice(page.value * 2, page.value * 2 + 2))
watch(
  () => props.items,
  () => {
    page.value = 0
  },
)
</script>
<template>
  <section class="home-news">
    <div class="container-page">
      <HomeSectionTitle :title="t('academy.news')" :subtitle="t('home.newsSubtitle')" />
      <ul v-if="visible.length" class="home-news__list">
        <li v-for="item in visible" :key="item.id">
          <NuxtLink class="home-news__card" :to="localePath(`/news/${item.id}`)">
            <img
              v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
              class="home-news__cover"
              :src="apiUrl(item.coverUrl)"
              alt=""
              loading="lazy"
            />
            <div class="home-news__copy">
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
            </div>
          </NuxtLink>
        </li>
      </ul>
      <AppEmpty v-else :description="t('common.empty')" />
      <div v-if="pages > 1" class="home-news__dots" :aria-label="t('academy.news')">
        <button
          v-for="dot in pages"
          :key="dot"
          type="button"
          :class="{ 'is-active': dot - 1 === page }"
          :aria-label="t('home.slide', { page: dot })"
          :aria-pressed="dot - 1 === page"
          @click="page = dot - 1"
        />
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.home-news {
  padding: 48px 0;
  background: #f4f7fb;

  &__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 36px;
    margin: 36px 0 0;
    padding: 0;
    list-style: none;
  }

  &__card {
    position: relative;
    display: flex;
    overflow: hidden;
    min-height: 373px;
    align-items: flex-end;
    padding: 28px;
    border-radius: 16px;
    background: #101f33;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, rgb(7 25 45 / 92%), rgb(7 25 45 / 0%) 48%);
    }
  }

  &__cover {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__copy {
    position: relative;
    z-index: 1;
  }

  h3 {
    margin: 0;
    color: #fff;
    font-size: 25px;
    font-weight: 500;
    line-height: 38px;
  }

  p {
    margin: 15px 0 0;
    color: #e1e9f2;
    font-size: 12px;
    line-height: 22px;
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 36px;

    button {
      width: 8px;
      height: 8px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: #cbe7fe;
      cursor: pointer;
    }

    .is-active {
      width: 16px;
      background: var(--home-color-primary);
    }
  }
}

@media (max-width: 700px) {
  .home-news {
    &__list {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    &__card {
      min-height: 320px;
      padding: 24px;
    }

    h3 {
      font-size: 22px;
      line-height: 32px;
    }
  }
}
</style>
