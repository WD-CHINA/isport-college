<script setup lang="ts">
import { UiBrandLogo } from '@isport/ui-core'

const { t } = useI18n()
const localePath = useLocalePath()

const year = new Date().getFullYear()

const links = computed(() => [
  { to: localePath('/'), label: t('nav.home') },
  { to: localePath('/resources'), label: t('academy.resources') },
  { to: localePath('/research'), label: t('academy.research') },
  { to: localePath('/schools'), label: t('academy.schools') },
  { to: localePath('/admin/creation'), label: t('academy.creation') },
  { to: localePath('/legal/terms'), label: t('academy.terms') },
  { to: localePath('/legal/privacy'), label: t('academy.privacy') },
])
</script>

<template>
  <footer class="app-footer">
    <div class="container-page app-footer__inner">
      <div class="app-footer__brand">
        <UiBrandLogo :name="t('seo.siteName')" inverse />
        <p class="app-footer__slogan">{{ t('home.heroSubtitle') }}</p>
      </div>
      <nav class="app-footer__nav" :aria-label="t('common.menu')">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="app-footer__link">
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
    <div class="app-footer__copy container-page">© {{ year }} {{ t('seo.siteName') }}</div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--ic-spacing-16, 64px);
  background-color: var(--ic-color-brand-900, #172554);
  color: rgb(255 255 255 / 82%);
}

.app-footer__inner {
  display: flex;
  flex-direction: column;
  gap: var(--ic-spacing-6, 24px);
  padding-top: var(--ic-spacing-10, 40px);
  padding-bottom: var(--ic-spacing-8, 32px);
}

.app-footer__slogan {
  margin-top: var(--ic-spacing-3, 12px);
  max-width: 32rem;
  font-size: var(--ic-font-size-sm, 14px);
  color: rgb(255 255 255 / 60%);
}

.app-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-4, 16px);
}

.app-footer__link {
  font-size: var(--ic-font-size-sm, 14px);
  color: rgb(255 255 255 / 82%);
}

.app-footer__link:hover {
  color: #fff;
}

.app-footer__copy {
  padding-top: var(--ic-spacing-4, 16px);
  padding-bottom: var(--ic-spacing-6, 24px);
  border-top: 1px solid rgb(255 255 255 / 12%);
  font-size: var(--ic-font-size-xs, 12px);
  color: rgb(255 255 255 / 50%);
}

@media (min-width: 768px) {
  .app-footer__inner {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}
</style>
