<script setup lang="ts">
import { isContentAssetUrl, type WebTeacher } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import HomeSectionTitle from './HomeSectionTitle.vue'
import HomeCarousel from './HomeCarousel.vue'

defineProps<{ people: WebTeacher[] }>()
const { t } = useI18n()
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
          <article class="home-people__card">
            <div class="home-people__quote">
              <img :src="`/home/figma/${row === 2 ? '3f802.svg' : '5f87f.svg'}`" alt="" />
              <p v-if="person.story" aria-label="教师故事" :title="person.story">
                {{ person.story }}
              </p>
            </div>
            <span class="home-people__divider" aria-hidden="true" />
            <span class="home-people__who">
              <img
                v-if="isContentAssetUrl(apiUrl(person.avatarUrl))"
                :src="apiUrl(person.avatarUrl)"
                alt=""
              />
              <i v-else aria-hidden="true" />
              <span>
                <strong>{{ person.name }}</strong>
                <em v-if="person.jobTitle" :title="person.jobTitle">{{ person.jobTitle }}</em>
                <small>{{ person.schoolOrg }}</small>
              </span>
            </span>
          </article>
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
    display: grid;
    min-height: 236px;
    grid-template-rows: 1fr 1px 48px;
    row-gap: 24px;
    padding: 24px;
    border-radius: 12px;
    background: #edf3ff;
    color: var(--ic-color-academy-text-primary);
  }

  p {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    margin: 0;
    font-size: 14px;
    line-height: 22px;
  }

  &__quote {
    display: grid;
    align-content: start;
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
    border-top: 1px solid var(--ic-color-academy-border-base);
  }

  &__who {
    display: flex;
    align-items: center;
    gap: 16px;

    > span {
      display: grid;
      min-width: 0;
      flex: 1;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 6px 12px;
    }

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
    min-width: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    display: block;
    overflow: hidden;
    grid-column: 1 / -1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    display: inline-block;
    overflow: hidden;
    max-width: 100%;
    justify-self: start;
    margin: 0;
    padding: 2px 8px;
    border-radius: 3px;
    background: rgb(0 149 238 / 15%);
    color: #004b83;
    font-size: 12px;
    font-style: normal;
    text-overflow: ellipsis;
    white-space: nowrap;
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
      grid-template-rows: 1fr 1px 72px;
      row-gap: 16px;
      padding: 20px;
    }

    &__quote p {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }

    &__who {
      gap: 12px;

      > span {
        grid-template-columns: minmax(0, 1fr);
        row-gap: 0;
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
    }

    em {
      margin: 4px 0;
      font-size: 11px;
    }
  }
}
</style>
