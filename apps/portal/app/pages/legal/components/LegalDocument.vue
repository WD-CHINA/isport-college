<script setup lang="ts">
import { RichTextContent } from '@isport/rich-text'
import termsHtml from '~/assets/legal/terms.html?raw'
import privacyHtml from '~/assets/legal/privacy.html?raw'

const props = defineProps<{ kind: 'terms' | 'privacy' }>()
const { t, locale } = useI18n()
const documents = {
  terms: { title: '用户协议', html: termsHtml },
  privacy: { title: '隐私协议', html: privacyHtml },
}
const document = computed(() => documents[props.kind])
</script>

<template>
  <div class="legal-document container-page">
    <article lang="zh-CN" :aria-labelledby="`legal-${kind}-title`">
      <h1 :id="`legal-${kind}-title`">{{ document.title }}</h1>
      <p v-if="locale === 'en'" class="legal-document__language" lang="en">
        {{ t('academy.legalLanguageNotice') }}
      </p>
      <RichTextContent class="legal-document__body" :content="document.html" />
    </article>
  </div>
</template>

<style lang="scss" scoped>
.legal-document {
  padding-block: 48px 64px;

  article {
    max-width: 960px;
    margin-inline: auto;
    color: var(--ic-color-academy-text-primary);
    overflow-wrap: anywhere;
  }

  h1 {
    margin: 0 0 24px;
    font-size: 30px;
    line-height: 1.5;
  }

  &__language {
    margin: 0 0 24px;
    color: var(--ic-color-academy-text-secondary);
    font-size: 14px;
    line-height: 1.75;
  }

  &__body {
    font-size: 16px;
    line-height: 1.9;

    :deep(p) {
      margin: 0 0 16px;
    }

    :deep(h2) {
      margin: 36px 0 16px;
      font-size: 22px;
      line-height: 1.5;
    }

    :deep(h3) {
      margin: 24px 0 12px;
      font-size: 18px;
      line-height: 1.6;
    }

    :deep(strong) {
      font-weight: 700;
    }
  }
}

@media (max-width: 767px) {
  .legal-document {
    padding-block: 28px 40px;

    h1 {
      font-size: 26px;
    }

    &__body {
      font-size: 15px;

      :deep(h2) {
        font-size: 20px;
      }

      :deep(h3) {
        font-size: 17px;
      }
    }
  }
}
</style>
