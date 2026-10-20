<script setup lang="ts">
import { isContentAssetUrl, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import ContentLink from '~/components/content/ContentLink.vue'
import ContentTypeIcon from '~/components/content/ContentTypeIcon.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import HomeSectionTitle from './HomeSectionTitle.vue'
import HomeCarousel from './HomeCarousel.vue'

defineProps<{ featured: WebContentCard[]; hot: WebContentCard[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
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
        <HomeCarousel
          v-if="featured.length"
          class="home-featured__carousel"
          :items="featured"
          :item-key="item => item.contentKey"
          :label="t('home.featuredTitle')"
          :peek="false"
          inset-controls
          autoplay
        >
          <template #default="{ item }">
            <article class="home-featured__spotlight">
              <div class="home-featured__cover">
                <img
                  v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                  :src="apiUrl(item.coverUrl)"
                  alt=""
                />
              </div>
              <div class="home-featured__copy">
                <span v-if="item.categoryName" class="home-featured__tag">{{
                  item.categoryName
                }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.summary }}</p>
                <ContentLink :content="item"
                  >{{ t('home.viewContent') }} <img src="/home/figma/ec1cf.svg" alt=""
                /></ContentLink>
              </div>
            </article>
          </template>
        </HomeCarousel>
        <aside class="home-featured__hot">
          <div class="home-featured__hot-head">
            <h3>{{ t('home.hotTitle') }}</h3>
            <NuxtLink :to="localePath('/resources')"
              >{{ t('home.viewAll') }} <img src="/home/figma/21c16.svg" alt=""
            /></NuxtLink>
          </div>
          <ul>
            <li v-for="(item, row) in hot.slice(0, 5)" :key="item.contentKey">
              <ContentLink :content="item">
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
              </ContentLink>
            </li>
          </ul>
          <AppEmpty v-if="!hot.length" :description="t('common.empty')" />
        </aside>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-featured {
  padding: 48px 0;
  background: var(--ic-color-academy-background-page);

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 24px;
    margin-top: 16px;
  }

  &__spotlight,
  &__hot {
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px var(--home-color-border);
    background: #fff;
  }

  &__spotlight {
    display: grid;
    align-content: start;
    grid-template-columns: minmax(0, 400fr) minmax(0, 344fr);
    gap: 24px;
    min-height: 409px;
    padding: 24px;
  }

  &__cover,
  &__thumb {
    border-radius: 8px;
    background: var(--ic-color-academy-background-placeholder);
  }

  &__cover {
    overflow: hidden;
    height: 320px;
  }

  &__cover img,
  &__hot li > a > img:not(.home-featured__arrow) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    min-height: 320px;
    padding-block: 16px;
  }

  &__tag {
    color: var(--ic-color-academy-primary);
    font-size: 12px;
    font-style: normal;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--ic-color-academy-tint);
  }

  &__copy h3,
  &__hot h3 {
    margin: 0;
    color: var(--ic-color-academy-text-primary);
  }

  &__copy {
    h3 {
      font-size: 24px;
      font-weight: 600;
      line-height: 38px;
    }

    p {
      margin: 0;
      color: var(--ic-color-academy-text-muted);
      font-size: 14px;
      line-height: 24px;
    }
  }

  &__hot {
    em {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: 4px;
      height: 20px;
      padding: 1px 4px;
      border: 0.5px solid var(--ic-color-academy-media-accent);
      border-radius: 3px;
      color: var(--ic-color-academy-media-text);
      font-size: 12px;
      font-style: normal;
      line-height: 16px;
    }

    em img {
      display: block;
      flex: none;
    }
  }

  &__hot-head {
    a {
      color: var(--ic-color-academy-primary);
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__copy {
    a {
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
      background: var(--ic-color-academy-tint);
    }
  }

  &__hot {
    padding: 24px;
  }

  &__hot-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  &__hot {
    h3 {
      font-size: 20px;
      font-weight: 600;
    }

    ul {
      display: grid;
      gap: 16px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--ic-color-academy-text-primary);
    }
  }

  &__hot li > a > img:not(.home-featured__arrow),
  &__thumb {
    width: 66px;
    height: 48px;
    flex: none;
  }

  &__thumb {
    display: grid;
    place-items: center;
  }

  &__hot-copy {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 6px;
  }

  &__hot {
    strong {
      overflow: hidden;
      font-size: 14px;
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__hot-head {
    a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      color: rgb(28 31 35 / 80%);
    }
  }

  &__hot {
    h3 {
      line-height: 32px;
    }

    .home-featured__arrow {
      width: auto;
      height: auto;
    }
  }

  &__copy a img,
  &__hot-head img {
    display: block;
    flex: none;
  }

  &__tag {
    background: rgb(0 149 238 / 15%);
    color: #004b83;
  }
}

@media (max-width: 960px) {
  .home-featured {
    &__layout,
    &__spotlight {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 767px) {
  .home-featured {
    &__layout {
      gap: 20px;
      margin-top: 20px;
    }

    &__spotlight {
      min-height: 0;
      padding: 16px 16px 56px;
      gap: 16px;
    }

    &__cover {
      position: relative;
      width: 100%;
      height: auto;
      max-height: 280px;

      &::before {
        display: block;
        padding-top: 62.5%;
        content: '';
      }

      img {
        position: absolute;
        inset: 0;
      }
    }

    &__copy {
      min-height: 0;
      padding: 0;
      gap: 10px;

      h3 {
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        font-size: 20px;
        line-height: 28px;
      }

      p {
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        font-size: 13px;
        line-height: 22px;
      }

      a {
        margin-top: 4px;
      }
    }

    &__hot {
      padding: 16px;

      h3 {
        font-size: 18px;
        line-height: 26px;
      }

      ul {
        gap: 12px;
      }
    }

    &__hot-head {
      margin-bottom: 16px;
    }

    &__hot li > a > img:not(.home-featured__arrow),
    &__thumb {
      width: 56px;
      height: 44px;
    }
  }
}
</style>
