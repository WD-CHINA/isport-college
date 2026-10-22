<script setup lang="ts">
import { isContentAssetUrl, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import ContentLink from '~/components/content/ContentLink.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import HomeSectionTitle from './HomeSectionTitle.vue'
import HomeCarousel from './HomeCarousel.vue'
const props = defineProps<{ items: WebContentCard[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const visible = computed(() => props.items.slice(0, 3))
</script>
<template>
  <section class="home-schools">
    <div class="container-page">
      <HomeSectionTitle
        more-icon="/home/figma/54f4c.svg"
        :title="t('academy.schools')"
        :subtitle="t('home.schoolsSubtitle')"
        :more="t('home.allSchools')"
        :to="localePath('/schools')"
      />
      <HomeCarousel
        v-if="visible.length"
        class="home-schools__list"
        :items="visible"
        :item-key="item => item.contentKey"
        :label="t('academy.schools')"
        :desktop-slides="3"
      >
        <template #default="{ item }">
          <ContentLink class="home-schools__card card-feedback" :content="item">
            <span class="home-schools__cover image-zoom"
              ><img
                v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                class="image-zoom__image"
                :src="apiUrl(item.coverUrl)"
                alt=""
                loading="lazy"
            /></span>
            <h3 class="card-feedback__title">{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
          </ContentLink>
        </template>
      </HomeCarousel>
      <AppEmpty v-else class="home-schools__empty" :description="t('common.empty')" />
    </div>
  </section>
</template>
<style lang="scss" scoped>
.home-schools {
  padding: 48px 0;
  background: var(--ic-color-academy-background-page);

  &__list {
    margin: 36px 0 0;
  }

  &__card {
    height: 100%;
    display: flex;
    min-height: 368px;
    flex-direction: column;
    padding: 24px;
    border: 1px solid var(--home-color-border);
    border-radius: 12px;
    background: #fff;
  }

  &__cover {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: 6px;
    background: var(--ic-color-academy-background-placeholder);

    &::before {
      display: block;
      padding-top: 55.9524%;
      content: '';
    }

    img {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h3 {
    margin: 24px 0 0;
    color: var(--card-feedback-title, var(--home-color-text));
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
  }

  p {
    margin: 12px 0 0;
    color: var(--ic-color-academy-text-secondary);
    font-size: 12px;
    line-height: 22px;
  }

  &__empty {
    margin-top: 36px;
    padding-block: 48px;
  }
}

@media (max-width: 767px) {
  .home-schools {
    &__list {
      margin-top: 20px;
    }

    &__card {
      min-height: 0;
      padding: 14px;
    }

    &__cover {
      max-height: 240px;
      border-radius: var(--ic-border-radius-md);

      &::before {
        padding-top: 62.5%;
      }
    }

    h3 {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      margin-top: 16px;
      font-size: 15px;
      line-height: 22px;
    }

    p {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      margin-top: 8px;
      line-height: 20px;
    }
  }
}
</style>
