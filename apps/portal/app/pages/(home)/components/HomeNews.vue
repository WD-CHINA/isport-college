<script setup lang="ts">
import { isContentAssetUrl, type WebNews } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import ContentLink from '~/components/content/ContentLink.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import HomeSectionTitle from './HomeSectionTitle.vue'
import HomeCarousel from './HomeCarousel.vue'
defineProps<{ items: WebNews[] }>()
const { t } = useI18n()
const apiUrl = useApiUrl()
</script>
<template>
  <section class="home-news">
    <div class="container-page">
      <HomeSectionTitle :title="t('academy.news')" :subtitle="t('home.newsSubtitle')" />
      <HomeCarousel
        v-if="items.length"
        class="home-news__list"
        :items="items"
        :item-key="item => item.id"
        :label="t('academy.news')"
        :desktop-slides="2"
        :desktop-gap="36"
      >
        <template #default="{ item }">
          <ContentLink class="home-news__card" :content="item">
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
          </ContentLink>
        </template>
      </HomeCarousel>
      <AppEmpty v-else :description="t('common.empty')" />
    </div>
  </section>
</template>
<style lang="scss" scoped>
.home-news {
  padding: 48px 0;
  background: var(--ic-color-academy-background-section);

  &__list {
    margin: 36px 0 0;
  }

  &__card {
    height: 100%;
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
}

@media (max-width: 767px) {
  .home-news {
    &__list {
      margin-top: 20px;
    }

    &__card {
      min-height: 280px;
      padding: 20px;
      border-radius: var(--ic-border-radius-lg);
    }

    h3 {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      font-size: 20px;
      line-height: 28px;
    }

    p {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      margin-top: 10px;
      line-height: 20px;
    }
  }
}
</style>
