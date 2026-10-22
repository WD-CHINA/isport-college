<script setup lang="ts">
import { isContentAssetUrl, type WebContentCard } from '@isport/shared'
import ContentLink from './ContentLink.vue'
import ContentTypeIcon from './ContentTypeIcon.vue'
import { useApiUrl } from '~/utils/api-url'

const props = defineProps<{ content: WebContentCard }>()
const apiUrl = useApiUrl()
const coverUrl = computed(() => apiUrl(props.content.coverUrl))
const imageFailed = shallowRef(false)
watch(coverUrl, () => {
  imageFailed.value = false
})
</script>

<template>
  <ContentLink :content="content" class="content-recommendation">
    <span class="content-recommendation__cover image-zoom">
      <img
        v-if="isContentAssetUrl(coverUrl) && !imageFailed"
        class="image-zoom__image"
        :src="coverUrl"
        alt=""
        width="80"
        height="64"
        loading="lazy"
        @error="imageFailed = true"
      />
      <ContentTypeIcon v-else :type="content.detailType" :size="24" />
    </span>
    <span class="content-recommendation__title">{{ content.title }}</span>
  </ContentLink>
</template>

<style lang="scss" scoped>
.content-recommendation {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: var(--ic-spacing-3);
  color: var(--ic-color-academy-article-aside-text);

  &__cover {
    display: grid;
    width: 80px;
    height: 64px;
    flex: 0 0 80px;
    place-items: center;
    overflow: hidden;
    border-radius: var(--ic-border-radius-md);
    background: var(--ic-color-academy-background-placeholder);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__title {
    display: -webkit-box;
    min-width: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    font-size: 14px;
    line-height: 23px;
    overflow-wrap: anywhere;
  }
}
</style>
