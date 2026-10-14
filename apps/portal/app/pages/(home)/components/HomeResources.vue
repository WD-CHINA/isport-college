<script setup lang="ts">
import { isContentAssetUrl, webContentPath, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import ContentMediaTag from '~/components/content/ContentMediaTag.vue'
import ContentTypeIcon from '~/components/content/ContentTypeIcon.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import HomeSectionTitle from './HomeSectionTitle.vue'

const props = defineProps<{
  categories: { id: string; name: string }[]
  category: string
  items: WebContentCard[]
  levels: { id: string; name: string }[]
  level: string
  levelItems: WebContentCard[]
}>()
const emit = defineEmits<{ select: [id: string]; level: [id: string] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const visible = computed(() => (props.level ? props.levelItems : props.items).slice(0, 8))
const levelOptions = computed(() => [
  { value: '', label: t('home.allLevels') },
  ...props.levels.map(item => ({ value: item.id, label: item.name })),
])

const categoryIcons: Record<string, string> = {
  '1': '82439.svg',
  '2': 'c65f9.svg',
  '3': '0beb2.svg',
  '4': 'e8dd8.svg',
}

function setLevel(value: unknown) {
  emit('level', typeof value === 'string' ? value : '')
}
</script>

<template>
  <section class="home-resources">
    <div class="container-page">
      <HomeSectionTitle
        :title="t('home.resourcesTitle')"
        :subtitle="t('home.resourcesSubtitle')"
        :more="t('home.moreResources')"
        :to="localePath('/resources')"
      />
      <div class="home-resources__filters">
        <div class="home-resources__categories" role="group" :aria-label="t('catalog.category')">
          <button
            v-for="item in categories"
            :key="item.id"
            type="button"
            :class="{ 'is-active': !level && item.id === category }"
            :aria-pressed="!level && item.id === category"
            @click="emit('select', item.id)"
          >
            <img
              v-if="categoryIcons[item.id]"
              :src="`/home/figma/${categoryIcons[item.id]}`"
              alt=""
            />
            {{ item.name }}
          </button>
        </div>
        <label for="home-resource-level" class="sr-only">{{ t('catalog.level') }}</label>
        <ASelect
          id="home-resource-level"
          class="home-resources__level"
          :value="level"
          :options="levelOptions"
          :virtual="false"
          @change="setLevel"
        />
      </div>
      <ul v-if="visible.length">
        <li v-for="item in visible" :key="item.contentKey">
          <NuxtLink :to="localePath(webContentPath(item))">
            <span class="home-resources__cover">
              <img
                v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
                class="home-resources__photo"
                :src="apiUrl(item.coverUrl)"
                alt=""
              />
              <ContentTypeIcon v-else :type="item.detailType" :size="40" />
            </span>
            <span class="home-resources__body">
              <ContentMediaTag :type="item.detailType" />
              <strong>{{ item.title }}</strong>
              <small v-if="item.categoryName">{{
                t('home.suitable', { name: item.categoryName })
              }}</small>
            </span>
          </NuxtLink>
        </li>
      </ul>
      <div v-else class="home-resources__empty">
        <AppEmpty :description="t('common.empty')" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-resources {
  padding: 48px 0;
  background: #fbfdff;
}

.home-resources__filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 36px;
}

.home-resources__categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.home-resources__filters button {
  height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--home-color-border);
  border-radius: 6px;
  background: #fff;
  color: #1c1f23;
  font-size: 14px;
}

.home-resources__level {
  min-width: 128px;
  flex-shrink: 0;
}

.home-resources__filters .is-active {
  border-color: transparent;
  background: #eaf5ff;
  color: #0077fa;
}

.home-resources ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.home-resources a {
  display: block;
  overflow: hidden;
  min-height: 278px;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px var(--home-color-border);
  background: #fff;
  color: #1c1f23;
}

.home-resources__cover {
  display: grid;
  place-items: center;
  height: 158px;
  background: #dce7f5;
}

.home-resources__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-resources__body {
  display: grid;
  gap: 8px;
  padding: 16px 24px 24px;
}

.home-resources strong {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}

.home-resources__filters img {
  display: block;
  flex: none;
}

.home-resources small {
  line-height: 22px;
  color: #68788c;
  font-size: 12px;
}

.home-resources__empty {
  display: grid;
  min-height: 278px;
  place-items: center;
  margin-top: 24px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (min-width: 961px) {
  .home-resources {
    padding-bottom: 36px;
  }
}

@media (max-width: 960px) {
  .home-resources ul {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .home-resources__filters,
  .home-resources ul {
    display: grid;
  }

  .home-resources ul {
    grid-template-columns: 1fr;
  }
}
</style>
