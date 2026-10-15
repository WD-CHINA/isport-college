<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import AppEmpty from '~/components/app/AppEmpty.vue'
import HomeSectionTitle from './HomeSectionTitle.vue'
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
      <ul v-if="visible.length" class="home-schools__list">
        <li v-for="item in visible" :key="item.contentKey">
          <NuxtLink class="home-schools__card" :to="localePath(webContentPath(item))">
            <span class="home-schools__cover"
              ><img
                v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                :src="apiUrl(item.coverUrl)"
                alt=""
                loading="lazy"
            /></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
          </NuxtLink>
        </li>
      </ul>
      <AppEmpty v-else class="home-schools__empty" :description="t('common.empty')" />
    </div>
  </section>
</template>
<style lang="scss" scoped>
.home-schools {
  padding: 48px 0;
  background: var(--ic-color-academy-background-page);

  &__list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    margin: 36px 0 0;
    padding: 0;
    list-style: none;
  }

  &__card {
    display: flex;
    min-height: 368px;
    flex-direction: column;
    padding: 24px;
    border: 1px solid var(--home-color-border);
    border-radius: 12px;
    background: #fff;
  }

  &__cover {
    display: block;
    overflow: hidden;
    aspect-ratio: 336 / 188;
    border-radius: 6px;
    background: var(--ic-color-academy-background-placeholder);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h3 {
    margin: 24px 0 0;
    color: var(--home-color-text);
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

@media (max-width: 900px) {
  .home-schools {
    &__list {
      grid-template-columns: 1fr;
    }

    &__card {
      min-height: 0;
    }
  }
}
</style>
