<script setup lang="ts">
import { UiBrandLogo, UiLocaleSelect } from '@isport/ui-core'

const auth = useAuthStore()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { localeModel, localeOptions } = useLocaleSwitch()

const menuOpen = shallowRef(false)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

const navItems = computed(() => [
  { to: localePath('/'), label: t('nav.home'), exact: true },
  { to: localePath('/courses'), label: t('nav.courses'), exact: false },
  { to: localePath('/admin'), label: t('nav.adminEntry'), exact: false },
])

function isActive(to: string, exact: boolean): boolean {
  return exact ? route.path === to : route.path.startsWith(to)
}

function openLogin() {
  auth.openLoginModal({ reason: 'default' })
}

async function handleLogout() {
  await auth.logout()
}
</script>

<template>
  <header class="app-header">
    <div class="container-page app-header__inner">
      <NuxtLink :to="localePath('/')" class="app-header__brand" :aria-label="t('seo.siteName')">
        <UiBrandLogo :name="t('seo.siteName')" />
      </NuxtLink>

      <!-- 桌面导航 -->
      <nav class="app-header__nav" :aria-label="t('nav.home')">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="app-header__link"
          :class="{ 'app-header__link--active': isActive(item.to, item.exact) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="app-header__actions">
        <UiLocaleSelect
          v-model="localeModel"
          :options="localeOptions"
          :label="t('common.language')"
        />
        <!-- 登录态仅存于客户端 localStorage，SSR 输出不含此区域，避免 hydration 不一致 -->
        <ClientOnly>
          <template v-if="auth.isLoggedIn">
            <span class="app-header__user">{{ auth.user?.name }}</span>
            <button type="button" class="btn-ghost" @click="handleLogout">
              {{ t('common.logout') }}
            </button>
          </template>
          <button v-else type="button" class="btn-primary" @click="openLogin">
            {{ t('common.login') }}
          </button>
        </ClientOnly>
        <!-- 移动端菜单按钮 -->
        <button
          type="button"
          class="app-header__burger"
          :aria-expanded="menuOpen"
          :aria-label="t('common.menu')"
          @click="menuOpen = !menuOpen"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              v-if="!menuOpen"
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <path
              v-else
              d="m5 5 10 10M15 5 5 15"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端导航面板 -->
    <nav v-if="menuOpen" class="app-header__panel">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="app-header__panel-link"
        :class="{ 'app-header__link--active': isActive(item.to, item.exact) }"
      >
        {{ item.label }}
      </NuxtLink>
      <button
        v-if="auth.isLoggedIn"
        type="button"
        class="app-header__panel-link text-left"
        @click="handleLogout"
      >
        {{ t('common.logout') }}（{{ auth.user?.name }}）
      </button>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--ic-z-index-sticky, 100);
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
  background-color: rgb(255 255 255 / 92%);
  backdrop-filter: blur(8px);
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: var(--ic-spacing-4, 16px);
  height: 60px;
}

.app-header__brand {
  flex-shrink: 0;
}

/* 窄屏仅显示 logo 图标：品牌文字与右侧操作区（语言/登录/菜单）争抢宽度会溢出视口 */
.app-header__brand :deep(.ui-brand-logo__name) {
  display: none;
}

.app-header__nav {
  display: none;
  align-items: center;
  gap: var(--ic-spacing-2, 8px);
  margin-inline-start: var(--ic-spacing-6, 24px);
}

.app-header__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--ic-spacing-3, 12px);
  border-radius: var(--ic-border-radius-md, 8px);
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
  transition: color var(--ic-motion-duration-fast, 150ms);
}

.app-header__link:hover {
  color: var(--ic-color-brand-500, #2563eb);
}

.app-header__link--active {
  color: var(--ic-color-brand-500, #2563eb);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--ic-spacing-2, 8px);
  margin-inline-start: auto;
}

.app-header__user {
  display: none;
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}

.app-header__burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--ic-color-text-primary, #0f172a);
}

.app-header__burger svg {
  width: 20px;
  height: 20px;
}

.app-header__panel {
  display: flex;
  flex-direction: column;
  padding: var(--ic-spacing-2, 8px) var(--ic-spacing-4, 16px);
  border-top: 1px solid var(--ic-color-border-base, #e2e8f0);
  background-color: var(--ic-color-background-container, #fff);
}

.app-header__panel-link {
  display: flex;
  align-items: center;
  min-height: 44px;
  border-radius: var(--ic-border-radius-md, 8px);
  padding: 0 var(--ic-spacing-3, 12px);
  font-size: var(--ic-font-size-base, 16px);
  color: var(--ic-color-text-primary, #0f172a);
}

@media (min-width: 768px) {
  .app-header__brand :deep(.ui-brand-logo__name) {
    display: inline;
  }

  .app-header__nav {
    display: flex;
  }

  .app-header__user {
    display: inline;
  }

  .app-header__burger,
  .app-header__panel {
    display: none;
  }
}
</style>
