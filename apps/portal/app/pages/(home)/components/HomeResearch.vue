<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
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
const cover = computed(() => (featured.value ? apiUrl(featured.value.coverUrl) : ''))
</script>

<template>
  <section class="home-research">
    <div class="container-page">
      <HomeSectionTitle
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
            {{ item.name }}
          </button>
        </div>
        <article v-if="featured" class="home-research__feature">
          <span class="home-research__photo">
            <img v-if="isContentAssetUrl(cover)" :src="cover" alt="" />
          </span>
          <div>
            <h3>{{ featured.title }}</h3>
            <p>{{ featured.summary }}</p>
            <NuxtLink :to="localePath(webContentPath(featured))"
              >{{ t('home.viewContent') }} ›</NuxtLink
            >
          </div>
        </article>
        <div class="home-research__side">
          <article v-for="item in side" :key="item.contentKey">
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <NuxtLink :to="localePath(webContentPath(item))"
              >{{ t('home.viewContent') }} ›</NuxtLink
            >
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-research {
  padding: 48px 0;
  background: #f4f7fb;
}

.home-research__layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 288px;
  gap: 24px;
  margin-top: 36px;
}

.home-research__nav {
  display: grid;
  align-content: start;
  gap: 16px;
}

.home-research__nav button,
.home-research__feature,
.home-research__side article {
  border: 0;
  border-radius: 12px;
  background: #fff;
  text-align: left;
}

.home-research__nav button {
  padding: 24px;
  color: #1c1f23;
  font-size: 16px;
}

.home-research__nav .is-active {
  outline: 2px solid #0077fa;
  color: #0077fa;
}

.home-research__feature {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  min-height: 352px;
  padding: 24px;
}

.home-research__photo {
  border-radius: 8px;
  background: #dce7f5;
}

.home-research__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.home-research__feature h3,
.home-research__side h3 {
  margin: 0;
  color: #1c1f23;
  font-size: 20px;
  font-weight: 600;
  line-height: 32px;
}

.home-research__feature p,
.home-research__side p {
  margin: 12px 0 0;
  color: #68788c;
  font-size: 14px;
  line-height: 22px;
}

.home-research__feature a,
.home-research__side a {
  display: inline-block;
  margin-top: 18px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #eaf5ff;
  color: #0077fa;
  font-size: 14px;
  font-weight: 500;
}

.home-research__side {
  display: grid;
  gap: 24px;
}

.home-research__side article {
  padding: 24px;
}

@media (max-width: 1100px) {
  .home-research__layout,
  .home-research__feature {
    grid-template-columns: 1fr;
  }
}
</style>
