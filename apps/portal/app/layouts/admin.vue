<script setup lang="ts">
import { UiBrandLogo, UiLocaleSelect } from '@isport/ui-core'
import {
  Drawer as ADrawer,
  Dropdown as ADropdown,
  Layout as ALayout,
  LayoutContent as ALayoutContent,
  LayoutHeader as ALayoutHeader,
  LayoutSider as ALayoutSider,
  Menu as AMenu,
  useBreakpoint,
} from 'antdv-next'

const auth = useAuthStore()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { localeModel, localeOptions } = useLocaleSwitch()
const screens = useBreakpoint()

// 第二层禁止收录措施：管理端布局输出等价 robots Meta（第一层为 Route Rules Header）
useSeoMeta({
  title: () => t('seo.adminTitle'),
  robots: 'noindex, nofollow, noarchive',
})

const drawerOpen = shallowRef(false)
const isDesktop = computed(() => screens.value?.lg ?? false)

watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  },
)

const menuItems = computed(() => [
  { key: localePath('/admin'), label: t('nav.dashboard') },
  { key: localePath('/admin/courses'), label: t('nav.courseManage') },
])

const selectedKeys = computed(() => {
  const matched = [...menuItems.value]
    .sort((a, b) => b.key.length - a.key.length)
    .find(item => route.path === item.key || route.path.startsWith(`${item.key}/`))
  return matched ? [matched.key] : []
})

const userMenuItems = computed(() => [
  { key: 'portal', label: t('common.backHome') },
  { key: 'logout', label: t('common.logout') },
])

function handleMenuClick({ key }: { key: string | number }) {
  void navigateTo(String(key))
}

function handleUserMenuClick({ key }: { key: string | number }) {
  if (key === 'logout') {
    void auth.logout().then(async () => {
      await navigateTo(localePath('/'))
    })
    return
  }
  void navigateTo(localePath('/'))
}
</script>

<template>
  <!-- 未登录门禁空态：登录弹窗已由路由门禁打开 -->
  <div v-if="!auth.isLoggedIn" class="admin-gate">
    <p class="admin-gate__text">{{ t('auth.gateAdmin') }}</p>
    <NuxtLink :to="localePath('/')" class="btn-outline">
      {{ t('common.backHome') }}
    </NuxtLink>
  </div>

  <ALayout v-else class="admin-layout">
    <!-- 桌面侧边导航 -->
    <ALayoutSider v-if="isDesktop" :width="232" theme="light" class="admin-sider">
      <NuxtLink :to="localePath('/')" class="admin-sider__logo">
        <UiBrandLogo :name="t('seo.siteName')" />
      </NuxtLink>
      <AMenu
        :items="menuItems"
        :selected-keys="selectedKeys"
        mode="inline"
        class="admin-sider__menu"
        @click="handleMenuClick"
      />
    </ALayoutSider>

    <ALayout>
      <ALayoutHeader class="admin-header">
        <button
          v-if="!isDesktop"
          type="button"
          class="admin-header__burger"
          :aria-label="t('common.menu')"
          @click="drawerOpen = true"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <span class="admin-header__title">{{ t('seo.adminTitle') }}</span>
        <div class="admin-header__right">
          <UiLocaleSelect
            v-model="localeModel"
            :options="localeOptions"
            :label="t('common.language')"
          />
          <ADropdown :trigger="['click']">
            <button type="button" class="admin-header__user">
              {{ auth.user?.name }}
            </button>
            <template #popupRender>
              <AMenu :items="userMenuItems" @click="handleUserMenuClick" />
            </template>
          </ADropdown>
        </div>
      </ALayoutHeader>

      <ALayoutContent class="admin-content">
        <slot />
      </ALayoutContent>
    </ALayout>

    <!-- 移动端抽屉导航 -->
    <ADrawer
      v-if="!isDesktop"
      v-model:open="drawerOpen"
      placement="left"
      :width="260"
      :title="t('seo.adminTitle')"
    >
      <AMenu
        :items="menuItems"
        :selected-keys="selectedKeys"
        mode="inline"
        @click="handleMenuClick"
      />
    </ADrawer>
  </ALayout>
</template>

<style scoped>
.admin-gate {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ic-spacing-4, 16px);
  padding: var(--ic-spacing-4, 16px);
}

.admin-gate__text {
  color: var(--ic-color-text-secondary, #475569);
}

.admin-layout {
  min-height: 100vh;
}

.admin-sider {
  border-right: 1px solid var(--ic-color-border-base, #e2e8f0);
}

.admin-sider__logo {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 var(--ic-spacing-4, 16px);
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
}

.admin-sider__menu {
  border-inline-end: none;
}

.admin-header {
  display: flex;
  align-items: center;
  gap: var(--ic-spacing-3, 12px);
  height: 60px;
  padding: 0 var(--ic-spacing-4, 16px);
  background-color: var(--ic-color-background-container, #fff);
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
  line-height: 1.5;
}

.admin-header__title {
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.admin-header__right {
  display: flex;
  align-items: center;
  gap: var(--ic-spacing-2, 8px);
  margin-inline-start: auto;
}

.admin-header__burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-inline-start: calc(-1 * var(--ic-spacing-2, 8px));
  color: var(--ic-color-text-primary, #0f172a);
}

.admin-header__burger svg {
  width: 20px;
  height: 20px;
}

.admin-header__user {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--ic-spacing-3, 12px);
  border-radius: var(--ic-border-radius-md, 8px);
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-primary, #0f172a);
  cursor: pointer;
}

.admin-header__user:hover {
  background-color: var(--ic-color-background-page, #f8fafc);
}

.admin-content {
  padding: var(--ic-spacing-4, 16px);
}

@media (min-width: 1024px) {
  .admin-content {
    padding: var(--ic-spacing-6, 24px);
  }
}
</style>
