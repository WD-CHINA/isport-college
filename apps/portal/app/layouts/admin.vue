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

// 叶子菜单（用于选中匹配）：后台项 + 归入后台的创作中心子项。
const leafItems = computed(() => [
  { key: localePath('/admin'), label: t('nav.dashboard') },
  { key: localePath('/admin/courses'), label: t('nav.courseManage') },
  { key: localePath('/admin/creation'), label: t('creation.nav.overview') },
  { key: localePath('/admin/works'), label: t('creation.nav.works') },
  { key: localePath('/admin/points'), label: t('creation.nav.points') },
])

const menuItems = computed(() => [
  { key: localePath('/admin'), label: t('nav.dashboard') },
  { key: localePath('/admin/courses'), label: t('nav.courseManage') },
  {
    key: creationGroupKey,
    label: t('academy.creation'),
    children: [
      { key: localePath('/admin/creation'), label: t('creation.nav.overview') },
      { key: localePath('/admin/works'), label: t('creation.nav.works') },
      { key: localePath('/admin/points'), label: t('creation.nav.points') },
    ],
  },
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

  <ALayout v-else class="admin-layout">
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

    <ALayout>
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
  min-height: 100vh;
}

.admin-sider {
  padding-top: var(--ic-spacing-4, 16px);
  border-right: 1px solid var(--ic-color-border-base, #e2e8f0);
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
  padding: var(--ic-spacing-4, 16px);
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
