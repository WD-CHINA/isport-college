<script setup lang="ts">
import { UiBrandLogo, UiLocaleSelect } from '@isport/ui-core'
import {
  Button as AButton,
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

// 第二层禁止收录措施：后台式布局输出等价 robots Meta（第一层为 Route Rules Header）
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

// 创作中心（概览 / 我的创作 / 我的积分）归入管理后台，作为可展开子菜单。
const creationGroupKey = 'creation-center'
const creationSections = ['/admin/creation', '/admin/works', '/admin/points']

const isCreationSection = computed(() =>
  creationSections.some(section => route.path.startsWith(localePath(section))),
)

const operationItems = computed(() => [
  ...(auth.can('admin:view') ? [{ key: localePath('/admin'), label: t('nav.dashboard') }] : []),
  ...(auth.can('course:manage')
    ? [{ key: localePath('/admin/courses'), label: t('nav.courseManage') }]
    : []),
])

const creationItems = computed(() =>
  auth.can('creation:use')
    ? [
        { key: localePath('/admin/creation'), label: t('creation.nav.overview') },
        { key: localePath('/admin/works'), label: t('creation.nav.works') },
        { key: localePath('/admin/points'), label: t('creation.nav.points') },
      ]
    : [],
)

// 叶子菜单和展示菜单都由同一权限结果派生，避免菜单可见但路由被拒绝。
const leafItems = computed(() => [...operationItems.value, ...creationItems.value])

const menuItems = computed(() => [
  ...operationItems.value,
  ...(creationItems.value.length > 0
    ? [
        {
          key: creationGroupKey,
          label: t('academy.creation'),
          children: creationItems.value,
        },
      ]
    : []),
])

const selectedKeys = computed(() => {
  const matched = [...leafItems.value]
    .sort((a, b) => b.key.length - a.key.length)
    .find(item => route.path === item.key || route.path.startsWith(`${item.key}/`))
  return matched ? [matched.key] : []
})

// 创作中心子菜单展开态：进入创作相关路由时自动展开。
const openKeys = ref<string[]>([])
watch(
  () => route.path,
  () => {
    if (isCreationSection.value) openKeys.value = [creationGroupKey]
  },
  { immediate: true },
)

function handleOpenChange(keys: (string | number)[]) {
  openKeys.value = keys.map(String)
}

const userMenuItems = computed(() => [
  { key: 'portal', label: t('common.backHome') },
  { key: 'logout', label: t('common.logout') },
])

function handleMenuClick({ key }: { key: string | number }) {
  const path = String(key)
  // 子菜单父项（创作中心）不是路由，仅用于展开，忽略其点击。
  if (!path.startsWith('/')) return
  void navigateTo(path)
}

function handleUserMenuClick({ key }: { key: string | number }) {
  if (key === 'logout') {
    auth.logoutConfirmVisible = true
    return
  }
  void navigateTo(localePath('/'))
}

function goHome() {
  void navigateTo(localePath('/'))
}
</script>

<template>
  <!-- 管理端未登录门禁空态：登录弹窗已由路由门禁打开 -->
  <div v-if="!auth.isLoggedIn" class="admin-gate">
    <p class="admin-gate__text">{{ t('auth.gateAdmin') }}</p>
    <AButton @click="goHome">{{ t('common.backHome') }}</AButton>
  </div>

  <ALayout
    v-else
    :has-sider="isDesktop"
    class="admin-layout"
    :class="{ 'admin-layout--desktop': isDesktop }"
  >
    <!-- 桌面侧边导航 -->
    <ALayoutSider v-if="isDesktop" :width="232" theme="light" class="admin-sider">
      <AMenu
        :items="menuItems"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        mode="inline"
        class="admin-sider__menu"
        @click="handleMenuClick"
        @open-change="handleOpenChange"
      />
    </ALayoutSider>

    <ALayout class="admin-main">
      <ALayoutHeader class="admin-header">
        <AButton
          v-if="!isDesktop"
          type="text"
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
        </AButton>
        <NuxtLink :to="localePath('/')" class="admin-header__brand">
          <UiBrandLogo :name="t('seo.siteName')" />
        </NuxtLink>
        <span class="admin-header__divider" aria-hidden="true"></span>
        <span class="admin-header__title">{{ t('seo.adminTitle') }}</span>
        <div class="admin-header__right">
          <UiLocaleSelect
            v-model="localeModel"
            :options="localeOptions"
            :label="t('common.language')"
          />
          <ADropdown
            v-if="auth.isLoggedIn"
            :trigger="['click']"
            :menu="{ items: userMenuItems }"
            @menu-click="handleUserMenuClick"
          >
            <AButton type="text" class="admin-header__user">
              {{ auth.user?.name }}
            </AButton>
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
      :size="260"
      :title="t('seo.adminTitle')"
    >
      <AMenu
        :items="menuItems"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        mode="inline"
        @click="handleMenuClick"
        @open-change="handleOpenChange"
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
  --admin-header-height: 60px;
  --admin-sider-width: 232px;

  position: fixed;
  inset: 0;
  height: auto;
  min-height: 0;
  overflow: hidden;
  background-color: var(--ic-color-background-page, #f8fafc);
}

.admin-layout--desktop {
  padding-inline-start: var(--admin-sider-width);
}

.admin-main {
  box-sizing: border-box;
  min-width: 0;
  height: 100%;
  padding-block-start: var(--admin-header-height);
  overflow: hidden;
  background-color: var(--ic-color-background-page, #f8fafc);
}

.admin-sider {
  position: fixed;
  z-index: calc(var(--ic-z-index-sticky, 100) + 1);
  inset-block: 0;
  inset-inline-start: 0;
  height: 100vh;
  height: 100dvh;
  padding-top: var(--ic-spacing-4, 16px);
  overflow-y: auto;
  overscroll-behavior: contain;
  border-right: 1px solid var(--ic-color-border-base, #e2e8f0);
  scrollbar-gutter: stable;
}

.admin-sider__menu {
  border-inline-end: none;
}

.admin-header {
  position: fixed;
  z-index: var(--ic-z-index-sticky, 100);
  inset-block-start: 0;
  inset-inline: 0;
  display: flex;
  align-items: center;
  gap: var(--ic-spacing-3, 12px);
  box-sizing: border-box;
  height: var(--admin-header-height);
  padding: 0 var(--ic-spacing-4, 16px);
  background-color: var(--ic-color-background-container, #fff);
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
  line-height: 1.5;
}

.admin-layout--desktop .admin-header {
  inset-inline-start: var(--admin-sider-width);
}

.admin-header__brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.admin-header__divider {
  width: 1px;
  height: 22px;
  background-color: var(--ic-color-border-base, #e2e8f0);
}

.admin-header__title {
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-semibold, 600);
  white-space: nowrap;
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
  min-height: 44px;
}

.admin-content {
  min-height: 0;
  padding: var(--ic-spacing-4, 16px);
  overflow: auto;
  overscroll-behavior: contain;
}

@media (max-width: 767px) {
  .admin-header__divider {
    display: none;
  }
}

@media (min-width: 1024px) {
  .admin-content {
    padding: var(--ic-spacing-6, 24px);
  }
}
</style>
