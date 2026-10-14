<script setup lang="ts">
import type { ContentChannel } from '@isport/shared'

const props = defineProps<{ channel: ContentChannel; keyword?: string }>()
const emit = defineEmits<{ search: [keyword: string] }>()
const { t } = useI18n()
const keywordInput = shallowRef(props.keyword ?? '')
watch(
  () => props.keyword,
  value => {
    keywordInput.value = value ?? ''
  },
)
const resource = computed(() => props.channel === 'resource')
const title = computed(() =>
  resource.value
    ? t('catalog.resourceLibrary')
    : t(props.channel === 'research' ? 'nav.research' : 'catalog.channels.school'),
)
</script>

<template>
  <header class="catalog-hero" :class="`catalog-hero--${channel}`">
    <div class="catalog-hero__inner">
      <div class="catalog-hero__copy">
        <p v-if="resource" class="catalog-hero__eyebrow">{{ t('catalog.resourceEyebrow') }}</p>
        <h1>{{ title }}</h1>
        <form
          v-if="resource"
          class="catalog-hero__search"
          @submit.prevent="emit('search', keywordInput)"
        >
          <input
            v-model="keywordInput"
            type="search"
            maxlength="100"
            :aria-label="t('catalog.search')"
            :placeholder="t('catalog.resourceSearch')"
          />
          <button type="submit">{{ t('common.search') }}</button>
        </form>
        <p v-else class="catalog-hero__description">{{ t(`catalog.intro.${channel}`) }}</p>
      </div>
      <img
        v-if="!resource"
        class="catalog-hero__image"
        :src="`/catalog/ardot/${channel === 'research' ? 'research-hero.png' : 'schools-hero.jpg'}`"
        alt=""
        width="538"
        height="290"
      />
    </div>
  </header>
</template>

<style scoped>
.catalog-hero {
  height: 290px;
  background: #f4f7fb;
  color: var(--catalog-text);
}

.catalog-hero__inner {
  display: flex;
  width: min(100% - 48px, 1200px);
  height: 100%;
  align-items: center;
  justify-content: space-between;
  margin-inline: auto;
}

.catalog-hero__copy {
  min-width: 0;
}

.catalog-hero h1 {
  margin: 0;
  font-size: 34px;
  font-weight: 600;
  line-height: 48px;
}

.catalog-hero__description {
  max-width: 540px;
  margin: 22px 0 0;
  color: var(--catalog-muted);
  font-size: 14px;
  line-height: 27px;
}

.catalog-hero__image {
  width: 44.842%;
  height: 100%;
  margin-left: 70px;
  object-fit: cover;
}

.catalog-hero--resource {
  height: 400px;
  background: #3498ff url('/catalog/ardot/resources-hero.png') center / cover;
  color: #fff;
}

.catalog-hero--resource .catalog-hero__inner {
  align-items: flex-start;
  padding-top: 95px;
}

.catalog-hero__eyebrow {
  margin: 0 0 20px;
  font-size: 12px;
  line-height: 16px;
}

.catalog-hero__search {
  display: flex;
  overflow: hidden;
  width: 380px;
  max-width: 100%;
  height: 50px;
  margin-top: 30px;
  border-radius: 6px;
  background: #fff;
}

.catalog-hero__search input {
  width: 0;
  min-width: 0;
  flex: 1;
  padding: 0 15px;
  border: 0;
  color: var(--catalog-text);
  font-size: 14px;
}

.catalog-hero__search button {
  padding: 0 27px;
  border: 0;
  background: var(--catalog-primary);
  color: #fff;
  cursor: pointer;
}

@media (max-width: 767px) {
  .catalog-hero {
    height: auto;
  }

  .catalog-hero__inner {
    width: 100%;
    flex-direction: column;
  }

  .catalog-hero__copy {
    width: 100%;
    padding: 32px 24px;
  }

  .catalog-hero h1 {
    font-size: 28px;
    line-height: 40px;
  }

  .catalog-hero__image {
    width: 100%;
    height: 210px;
    margin: 0;
  }

  .catalog-hero--resource {
    min-height: 320px;
    background-position: 37% center;
  }

  .catalog-hero--resource .catalog-hero__inner {
    padding-top: 16px;
  }

  .catalog-hero__search {
    margin-top: 24px;
  }
}
</style>
