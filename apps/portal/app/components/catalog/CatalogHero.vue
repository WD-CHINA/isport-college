<script setup lang="ts">
import type { ContentChannel } from '@isport/shared'

const props = defineProps<{ channel: ContentChannel; keyword?: string }>()
const emit = defineEmits<{ search: [keyword: string] }>()
const { t } = useI18n()
const keywordInput = shallowRef(props.keyword ?? '')
const composing = shallowRef(false)
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
function submit() {
  if (composing.value) return
  keywordInput.value = keywordInput.value.trim()
  emit('search', keywordInput.value)
}
function clear() {
  keywordInput.value = ''
  emit('search', '')
  searchInput.value?.focus()
}
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
        <form v-if="resource" class="catalog-hero__search" @submit.prevent="submit">
          <input
            ref="searchInput"
            v-model="keywordInput"
            type="search"
            maxlength="100"
            :aria-label="t('catalog.search')"
            :placeholder="t('catalog.resourceSearch')"
            @compositionstart="composing = true"
            @compositionend="composing = false"
          />
          <button
            v-if="keywordInput"
            type="button"
            class="catalog-hero__clear"
            :aria-label="t('catalog.clearSearch')"
            @click="clear"
          >
            ×
          </button>
          <button type="submit">{{ t('common.search') }}</button>
        </form>
        <p v-else class="catalog-hero__description">{{ t(`catalog.intro.${channel}`) }}</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.catalog-hero {
  height: 400px;
  background-color: #1683ff;
  background-position: center;
  background-size: cover;
  color: #fff;
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
  max-width: 450px;
  margin: 24px 0 0;
  color: rgb(255 255 255 / 90%);
  font-size: 16px;
  line-height: 30px;
}

.catalog-hero--research {
  background-image: url('/catalog/ardot/research-hero.png');
}

.catalog-hero--school {
  background-image: url('/catalog/ardot/schools-hero.png');
}

.catalog-hero:not(.catalog-hero--resource) .catalog-hero__inner {
  align-items: flex-start;
  padding-top: 140px;
}

.catalog-hero:not(.catalog-hero--resource) .catalog-hero__copy {
  width: 470px;
  max-width: 100%;
}

.catalog-hero:not(.catalog-hero--resource) h1 {
  font-size: 44px;
  line-height: 62px;
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
  outline: none;
}

.catalog-hero__search button {
  padding: 0 27px;
  border: 0;
  background: var(--catalog-primary);
  color: #fff;
  cursor: pointer;
}

.catalog-hero__search .catalog-hero__clear {
  padding-inline: 12px;
  background: #fff;
  color: var(--catalog-muted);
  font-size: 20px;
}

.catalog-hero__search input::-webkit-search-cancel-button {
  display: none;
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

  .catalog-hero:not(.catalog-hero--resource) {
    min-height: 320px;
    background-position: 30% center;
  }

  .catalog-hero--research {
    background-image:
      linear-gradient(90deg, rgb(0 76 188 / 20%), rgb(0 76 188 / 50%)),
      url('/catalog/ardot/research-hero.png');
  }

  .catalog-hero--school {
    background-image:
      linear-gradient(90deg, rgb(0 76 188 / 20%), rgb(0 76 188 / 50%)),
      url('/catalog/ardot/schools-hero.png');
  }

  .catalog-hero:not(.catalog-hero--resource) .catalog-hero__inner {
    padding-top: 0;
  }

  .catalog-hero:not(.catalog-hero--resource) .catalog-hero__copy {
    width: 100%;
    padding: 64px 24px 56px;
  }

  .catalog-hero:not(.catalog-hero--resource) h1 {
    font-size: 32px;
    line-height: 44px;
  }

  .catalog-hero__description {
    font-size: 14px;
    line-height: 26px;
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
