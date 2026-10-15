<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import AppEmpty from '~/components/app/AppEmpty.vue'
import HomeSectionTitle from './HomeSectionTitle.vue'

const props = defineProps<{
  categories: { id: string; name: string }[]
  category: string
  items: WebContentCard[]
}>()
const emit = defineEmits<{ select: [id: string] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const featured = computed(() => props.items[0])
const side = computed(() => props.items.slice(1, 3))
const icons: Record<string, string> = {
  SERIES: '42431.svg',
  RESEARCH: '3b93a.svg',
  TOPICS: 'e30de.svg',
  PRODUCTS: '4a368.svg',
}
const cover = computed(() => (featured.value ? apiUrl(featured.value.coverUrl) : ''))
</script>

<template>
  <section class="home-research">
    <div class="container-page">
      <HomeSectionTitle
        more-icon="/home/figma/54f4c.svg"
        :title="t('home.researchTitle')"
        :subtitle="t('home.researchSubtitle')"
        :more="t('home.allCourses')"
        :to="localePath('/research')"
      />
      <div class="home-research__layout">
        <div class="home-research__nav" role="group" :aria-label="t('home.researchTitle')">
          <button
            v-for="item in categories"
            :key="item.id"
            type="button"
            :class="{ 'is-active': item.id === category }"
            :aria-pressed="item.id === category"
            @click="emit('select', item.id)"
          >
            <span class="home-research__icon"
              ><img :src="`/home/figma/${icons[item.id]}`" alt=""
            /></span>
            {{ item.name }}
          </button>
        </div>
        <div
          v-if="featured"
          class="home-research__courses"
          :class="{ 'home-research__courses--full': !side.length }"
        >
          <article class="home-research__feature">
            <span class="home-research__photo">
              <img v-if="isContentAssetUrl(cover)" :src="cover" alt="" />
            </span>
            <div>
              <h3>{{ featured.title }}</h3>
              <p>{{ featured.summary }}</p>
              <NuxtLink :to="localePath(webContentPath(featured))"
                >{{ t('home.viewContent') }} <img src="/home/figma/75760.svg" alt=""
              /></NuxtLink>
            </div>
          </article>
          <div v-if="side.length" class="home-research__side">
            <article v-for="(item, row) in side" :key="item.contentKey">
              <span v-if="row" class="home-research__divider"
                ><img src="/home/figma/be8e9.svg" alt=""
              /></span>
              <span class="home-research__side-photo"
                ><img
                  v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                  :src="apiUrl(item.coverUrl)"
                  alt=""
              /></span>
              <div class="home-research__side-copy">
                <h3>{{ item.title }}</h3>
                <p>{{ item.summary }}</p>
                <NuxtLink :to="localePath(webContentPath(item))"
                  >{{ t('home.viewContent') }} <img src="/home/figma/75760.svg" alt=""
                /></NuxtLink>
              </div>
            </article>
          </div>
        </div>
        <AppEmpty v-if="!featured" class="home-research__empty" :description="t('common.empty')" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-research {
  padding: 48px 0;
  background: var(--ic-color-academy-background-section);

  &__layout {
    display: grid;
    gap: 24px;
    margin-top: 36px;
  }

  &__nav {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 76px;
      padding: 20px 12px;
      border: 2px solid transparent;
      border-radius: 10px;
      background: #fff;
      color: var(--home-color-text);
      font-size: 18px;
      line-height: 28px;
      cursor: pointer;
    }

    .is-active {
      border-color: var(--home-color-primary);
      color: var(--home-color-primary);
      box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
    }
  }

  &__icon {
    display: grid;
    width: 28px;
    height: 28px;
    flex: none;
    place-items: center;

    img {
      display: block;
    }
  }

  &__courses {
    display: grid;
    grid-template-columns: minmax(0, 720fr) minmax(0, 454fr);
    gap: 24px;
    border: 1px solid var(--home-color-border);
    border-radius: 12px;
    background: #fff;

    &--full {
      grid-template-columns: 1fr;
    }
  }

  &__feature {
    display: grid;
    grid-template-columns: minmax(0, 304px) minmax(0, 1fr);
    gap: 24px;
    min-height: 352px;
    padding: 24px;
  }

  &__photo {
    display: block;
    overflow: hidden;
    height: 304px;
    border-radius: 8px;
    background: var(--ic-color-academy-background-placeholder);
  }

  &__photo img,
  &__side-photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__feature {
    > div {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      padding-block: 16px;
    }

    h3 {
      margin: 0;
      color: var(--home-color-text);
      font-size: 23px;
      font-weight: 600;
      line-height: 37px;
    }

    p {
      margin: 18px 0 auto;
      color: var(--ic-color-academy-text-secondary);
      font-size: 14px;
      line-height: 22px;
    }
  }

  &__feature a,
  &__side a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 16px;
    padding: 6px 12px;
    border-radius: 6px;
    background: var(--home-color-tint);
    color: var(--home-color-primary);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  &__feature a img,
  &__side a img {
    display: block;
    flex: none;
  }

  &__side {
    display: grid;
    min-height: 352px;
    align-content: start;

    article {
      position: relative;
      display: grid;
      grid-template-columns: 120px minmax(0, 1fr);
      gap: 24px;
      padding: 24px;
    }
  }

  &__divider {
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    overflow: hidden;

    img {
      display: block;
    }
  }

  &__side-photo {
    display: block;
    overflow: hidden;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    background: var(--ic-color-academy-background-placeholder);
  }

  &__side-copy {
    min-width: 0;
  }

  &__side {
    h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 600;
      line-height: 27px;
    }

    p {
      display: -webkit-box;
      overflow: hidden;
      margin: 8px 0 0;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      color: var(--ic-color-academy-text-secondary);
      font-size: 12px;
      line-height: 22px;
    }

    a {
      margin-top: 8px;
    }
  }

  &__empty {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1100px) {
  .home-research {
    &__courses {
      grid-template-columns: 1fr;
      border: 0;
      background: transparent;
    }

    &__feature {
      border: 1px solid var(--home-color-border);
      border-radius: 12px;
      background: #fff;
    }

    &__side {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      min-height: 0;
      border: 1px solid var(--home-color-border);
      border-radius: 12px;
      background: #fff;

      article {
        grid-template-columns: 100px minmax(0, 1fr);
        gap: 16px;
      }
    }

    &__side-photo {
      width: 100px;
      height: 100px;
    }
  }
}

@media (max-width: 700px) {
  .home-research {
    &__nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      button {
        font-size: 14px;
      }
    }

    &__feature {
      grid-template-columns: 1fr;
    }

    &__photo {
      height: 260px;
    }

    &__side {
      grid-template-columns: 1fr;
    }
  }
}
</style>
