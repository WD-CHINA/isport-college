<script setup lang="ts">
import { useLoginUiStore } from '~/stores/login-ui'
import { useAuthStore } from '~/stores/auth'
import AccountAvatar from '~/components/auth/AccountAvatar.vue'
import AppLocaleMenu from '~/components/app/AppLocaleMenu.vue'
import AppHeaderPanel from '~/components/app/AppHeaderPanel.vue'

const auth = useAuthStore()
const loginUi = useLoginUiStore()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const menuOpen = shallowRef(false)
const header = useTemplateRef<HTMLElement>('header')
const menuToggle = useTemplateRef<HTMLButtonElement>('menuToggle')
const menuId = useId()

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

const mainNav = computed(() => [
  {
    to: localePath('/'),
    label: t('nav.home'),
    exact: true,
    icon: 'm3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9',
  },
  {
    to: localePath('/resources'),
    label: t('academy.resources'),
    exact: false,
    icon: 'M12 6v15M12 6C9 4 5 4 3 5v14c3-1 6-1 9 2 3-3 6-3 9-2V5c-2-1-6-1-9 1Z',
  },
  {
    to: localePath('/research'),
    label: t('nav.research'),
    exact: false,
    icon: 'M9 18h6M9 21h6M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z',
  },
  {
    to: localePath('/schools'),
    label: t('academy.schools'),
    exact: false,
    icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01M9 12h.01M15 12h.01',
  },
])
const panelNav = computed(() =>
  mainNav.value.map(item => ({ ...item, active: isActive(item.to, item.exact) })),
)

function isActive(to: string, exact: boolean): boolean {
  return exact ? route.path === to : route.path.startsWith(to)
}

function openLogin() {
  menuOpen.value = false
  loginUi.openLoginModal({ reason: 'default' })
}

function handleLogout() {
  menuOpen.value = false
  loginUi.logoutConfirmVisible = true
}

function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuToggle.value?.focus()
}

function handleOutsidePointer(event: PointerEvent) {
  if (menuOpen.value && event.target instanceof Node && !header.value?.contains(event.target)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onScopeDispose(() => {
  if (import.meta.client) document.removeEventListener('pointerdown', handleOutsidePointer)
})
</script>

<template>
  <header ref="header" class="app-header" @keydown.esc="closeMenu">
    <div class="container-page app-header__inner">
      <div class="app-header__leading">
        <NuxtLink :to="localePath('/')" class="app-header__brand" :aria-label="t('nav.brand')">
          <span class="app-header__logo">
            <img src="/home/figma/5aa99.svg" alt="" />
          </span>
        </NuxtLink>
        <nav class="app-header__nav" :aria-label="t('nav.home')">
          <NuxtLink
            v-for="item in mainNav"
            :key="item.to"
            :to="item.to"
            class="app-header__link"
            :class="{ 'app-header__link--active': isActive(item.to, item.exact) }"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="app-header__actions">
        <NuxtLink :to="localePath('/lingyue/simulation')" class="app-header__cta-lingyue">
          {{ t('nav.lingyue') }}
        </NuxtLink>
        <span class="app-header__cta-creation" :title="t('academy.unavailable')">
          {{ t('nav.creation') }}
        </span>
        <AppLocaleMenu />
        <template v-if="auth.isLoggedIn">
          <NuxtLink :to="localePath('/account')" class="app-header__user">
            <AccountAvatar v-if="auth.user" :avatar-code="auth.user.avatarCode" />
            <span>{{ auth.user?.nickname || t('academy.account') }}</span>
          </NuxtLink>
          <button type="button" class="app-header__login" @click="handleLogout">
            {{ t('common.logout') }}
          </button>
        </template>
        <button v-else type="button" class="app-header__login" @click="openLogin">
          {{ t('common.login') }}
        </button>
        <button
          ref="menuToggle"
          type="button"
          class="app-header__burger"
          :aria-expanded="menuOpen"
          :aria-controls="menuId"
          :aria-label="t('common.menu')"
          @click="menuOpen = !menuOpen"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
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

    <Transition name="header-panel">
      <AppHeaderPanel
        v-if="menuOpen"
        :id="menuId"
        :items="panelNav"
        :logged-in="auth.isLoggedIn"
        :nickname="auth.user?.nickname"
        :avatar-code="auth.user?.avatarCode"
        @close="menuOpen = false"
        @login="openLogin"
        @logout="handleLogout"
      />
    </Transition>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--ic-z-index-sticky, 100);
  background: #fff;
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  height: 66px;
}

.app-header__leading {
  display: flex;
  align-items: center;
  gap: 60px;
  min-width: 0;
}

.app-header__brand {
  flex: none;
  color: #1c1f23;
  font-size: 22px;
  font-weight: 600;
  line-height: 35px;
  white-space: nowrap;
}

.app-header__logo {
  display: block;
  width: 130.034px;
  height: 30px;
  mask: url('/home/figma/c86ca.svg') center / contain no-repeat;
}

.app-header__logo img {
  display: block;
}

.app-header__nav {
  display: none;
  align-items: center;
  gap: 24px;
}

.app-header__nav:lang(en-US) {
  gap: 0;
}

.app-header__link {
  display: inline-flex;
  align-items: center;
  height: 32px;
  min-width: 80px;
  justify-content: center;
  padding: 0 12px;
  border-radius: 3px;
  color: #1c1f23;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
}

.app-header__link--active {
  color: #0077fa;
  font-weight: 600;
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-inline-start: auto;
}

.app-header__cta-lingyue,
.app-header__cta-creation {
  display: none;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
}

.app-header__cta-lingyue {
  background: linear-gradient(109deg, #0079ff 0%, #a348f3 100%);
  color: #fff;
}

.app-header__cta-creation {
  background: #eaf5ff;
  color: #0077fa;
  cursor: default;
}

.app-header__login {
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #1c1f23;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}

.app-header__user {
  display: none;
  align-items: center;
  gap: 8px;
  color: #1c1f23;
  font-size: 14px;
}

.app-header__burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #1c1f23;
  cursor: pointer;
}

.app-header__burger svg {
  width: 20px;
  height: 20px;
}

.header-panel-enter-active,
.header-panel-leave-active {
  transition:
    opacity var(--ic-motion-duration-fast, 150ms),
    transform var(--ic-motion-duration-fast, 150ms);
}

.header-panel-enter-from,
.header-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.app-header__burger:focus-visible {
  outline: 2px solid var(--ic-color-brand-500, #2563eb);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .app-header__inner {
    gap: 8px;
  }

  .app-header__actions {
    gap: 4px;
  }

  .app-header__login {
    padding-inline: 8px;
  }

  .app-header__burger {
    width: 36px;
  }
}

@media (min-width: 1280px) {
  .app-header__nav,
  .app-header__cta-lingyue,
  .app-header__cta-creation,
  .app-header__user {
    display: inline-flex;
  }

  .app-header__burger {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-panel-enter-active,
  .header-panel-leave-active {
    transition: none;
  }
}
</style>
