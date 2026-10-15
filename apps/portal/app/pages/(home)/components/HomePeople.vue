<script setup lang="ts">
import { isContentAssetUrl, type WebTeacher } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import HomeSectionTitle from './HomeSectionTitle.vue'
import HomeCarousel from './HomeCarousel.vue'

defineProps<{ people: WebTeacher[] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
</script>

<template>
  <section class="home-people">
    <div class="container-page">
      <HomeSectionTitle :title="t('home.teachersTitle')" :subtitle="t('home.teachersSubtitle')" />
      <HomeCarousel
        v-if="people.length"
        class="home-people__carousel"
        :items="people"
        :item-key="person => person.id"
        :label="t('home.teachersTitle')"
        :desktop-slides="3"
      >
        <template #default="{ item: person, index: row }">
          <NuxtLink class="home-people__card" :to="localePath(`/teachers/${person.id}`)">
            <div class="home-people__quote">
              <img :src="`/home/figma/${row === 2 ? '3f802.svg' : '5f87f.svg'}`" alt="" />
              <p>{{ person.story || person.honorTitle }}</p>
            </div>
            <span class="home-people__divider"><img src="/home/figma/e84bd.svg" alt="" /></span>
            <span class="home-people__who">
              <img
                v-if="isContentAssetUrl(apiUrl(person.avatarUrl))"
                :src="apiUrl(person.avatarUrl)"
                alt=""
              />
              <i v-else aria-hidden="true" />
              <span>
                <strong>{{ person.name }}</strong>
                <em v-if="person.jobTitle || person.honorTitle">{{
                  person.honorTitle || person.jobTitle
                }}</em>
                <small>{{ person.schoolOrg }}</small>
              </span>
            </span>
          </NuxtLink>
        </template>
      </HomeCarousel>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-people {
  padding: 48px 0;
  background: var(--ic-color-academy-background-page);

  &__carousel {
    margin-top: 36px;
  }

  &__card {
    height: 100%;
    display: flex;
    min-height: 236px;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px;
    border-radius: 12px;
    background: #edf3ff;
    color: var(--ic-color-academy-text-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
  }

  &__quote {
    display: grid;
    gap: 12px;

    img {
      width: auto;
      height: auto;
      border-radius: 0;
      background: none;
    }
  }

  &__divider {
    display: block;
    overflow: hidden;
    margin-top: 24px;

    img {
      display: block;
    }
  }

  &__who {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 24px;

    & img,
    & i {
      width: 48px;
      height: 48px;
      flex: none;
      border-radius: 50%;
      background: var(--ic-color-academy-text-muted);
      object-fit: cover;
    }
  }

  strong {
    display: inline;
    font-size: 16px;
    font-weight: 500;
  }

  small {
    display: block;
  }

  em {
    display: inline-block;
    margin: 0 0 6px 12px;
    padding: 2px 8px;
    border-radius: 3px;
    background: rgb(0 149 238 / 15%);
    color: #004b83;
    font-size: 12px;
    font-style: normal;
  }

  small {
    color: var(--ic-color-academy-text-muted);
    font-size: 12px;
  }
}

@media (max-width: 767px) {
  .home-people {
    &__carousel {
      margin-top: 20px;
    }

    &__card {
      min-height: 228px;
      padding: 20px;
    }

    &__quote p {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }

    &__divider {
      margin-top: 16px;
    }

    &__who {
      gap: 12px;
      margin-top: 16px;

      > span {
        min-width: 0;
      }

      img,
      i {
        width: 40px;
        height: 40px;
      }
    }

    strong {
      display: block;
      font-size: 15px;
      line-height: 22px;
      overflow-wrap: anywhere;
    }

    em {
      max-width: 100%;
      margin: 4px 0;
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
