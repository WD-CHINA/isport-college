<script setup lang="ts">
import { isContentAssetUrl, type WebContentCard } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import ContentLink from '~/components/content/ContentLink.vue'
import { useContentLevelLabel } from '~/composables/useContentLevelLabel'
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
const getLevelLabel = useContentLevelLabel()
const visible = computed(() =>
  (props.level ? props.levelItems : props.items)
    .slice(0, 8)
    .map(item => ({ ...item, levelLabel: getLevelLabel(item) })),
)
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
            <span
              v-if="categoryIcons[item.id]"
              class="home-resources__icon"
              :style="{ '--icon': `url(/home/figma/${categoryIcons[item.id]})` }"
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
          <ContentLink :content="item">
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
              <small v-if="item.levelLabel">{{
                t('home.suitable', { name: item.levelLabel })
              }}</small>
            </span>
          </ContentLink>
        </li>
      </ul>
      <div v-else class="home-resources__empty">
        <AppEmpty :description="t('common.empty')" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-resources {
  padding: 48px 0;
  background: var(--ic-color-academy-background-page);

  &__filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 36px;
  }

  &__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__filters {
    button {
      height: 32px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--home-color-border);
      border-radius: 6px;
      background: #fff;
      color: var(--ic-color-academy-text-primary);
      font-size: 14px;
    }
  }

  &__level {
    min-width: 128px;
    flex-shrink: 0;
  }

  &__filters {
    .is-active {
      border-color: transparent;
      background: var(--ic-color-academy-tint);
      color: var(--ic-color-academy-primary);
    }
  }

  ul {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
    margin: 24px 0 0;
    padding: 0;
    list-style: none;
  }

  a {
    display: block;
    overflow: hidden;
    min-height: 278px;
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px var(--home-color-border);
    background: #fff;
    color: var(--ic-color-academy-text-primary);
  }

  &__cover {
    display: grid;
    place-items: center;
    height: 158px !important;
    background: var(--ic-color-academy-background-placeholder);
    overflow: hidden;
  }

  &__photo {
    width: 100%;
    height: 158px !important;
    object-fit: cover;
  }

  &__body {
    display: grid;
    gap: 8px;
    padding: 16px 24px 24px;
  }

  strong {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
  }

  &__icon {
    display: block;
    flex: none;
    width: 20px;
    height: 20px;
    background-color: currentcolor;
    mask: var(--icon) center / 20px 20px no-repeat;
  }

  small {
    line-height: 22px;
    color: var(--ic-color-academy-text-muted);
    font-size: 12px;
  }

  &__empty {
    display: grid;
    min-height: 278px;
    place-items: center;
    margin-top: 24px;
  }
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
  .home-resources {
    ul {
      grid-template-columns: 1fr 1fr;
    }
  }
}

@media (max-width: 767px) {
  .home-resources {
    &__filters {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      margin-top: 20px;
    }

    &__categories {
      min-width: 0;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: thin;

      button {
        flex: none;
        height: 40px;
        font-size: 13px;
      }
    }

    &__level {
      min-width: 0;
      width: 100%;
    }

    ul {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }

    li {
      min-width: 0;
    }

    a {
      height: 100%;
      min-height: 0;
    }

    &__cover,
    &__photo {
      height: clamp(110px, 24vw, 200px) !important;
    }

    &__body {
      gap: 8px;
      padding: 12px;
    }

    strong {
      font-size: 14px;
      line-height: 21px;
    }

    small {
      font-size: 11px;
      line-height: 18px;
    }

    &__empty {
      min-height: 200px;
      margin-top: 20px;
    }
  }
}
</style>
