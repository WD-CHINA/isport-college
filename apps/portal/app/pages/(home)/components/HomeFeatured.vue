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

  &__dots {
    display: flex;
    grid-column: 1 / -1;
    justify-content: center;
    gap: 12px;

    button {
      width: 8px;
      height: 8px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: #cbe7fe;
    }

    .is-active {
      width: 16px;
      background: var(--ic-color-academy-primary);
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
</style>
