<script setup lang="ts">
import { useLoginUiStore } from '~/stores/login-ui'
import { useAuthStore } from '~/stores/auth'
import AccountAvatar from '~/components/auth/AccountAvatar.vue'
import AppHeaderPanel from '~/components/app/AppHeaderPanel.vue'
import { useLingyueLaunch } from '~/composables/useLingyueLaunch'

withDefaults(defineProps<{ creationCenter?: boolean }>(), { creationCenter: false })

const auth = useAuthStore()
const loginUi = useLoginUiStore()
const { openLingyue } = useLingyueLaunch()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const menuOpen = shallowRef(false)
const userMenuOpen = shallowRef(false)
const header = useTemplateRef<HTMLElement>('header')
const menuToggle = useTemplateRef<HTMLButtonElement>('menuToggle')
const menuId = useId()

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    userMenuOpen.value = false
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

const navigationPath = computed(() =>
  route.path.replace(/\/preview\/(?:article|resource)\/(?=(?:resources|research|schools)\/)/, '/'),
)

function isActive(to: string, exact: boolean): boolean {
  return exact ? navigationPath.value === to : navigationPath.value.startsWith(to)
}

function openLogin() {
  menuOpen.value = false
  loginUi.openLoginModal({ reason: 'default' })
}

function handleLogout() {
  menuOpen.value = false
  userMenuOpen.value = false
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
  <header
    ref="header"
    class="app-header"
    :class="{ 'app-header--creation': creationCenter }"
    @keydown.esc="closeMenu"
  >
    <div class="container-page app-header__inner">
      <div class="app-header__leading">
        <NuxtLink :to="localePath('/')" class="app-header__brand" :aria-label="t('nav.brand')">
          <span class="app-header__logo">
            <img src="/home/figma/5aa99.svg" alt="" />
          </span>
        </NuxtLink>
        <span v-if="creationCenter" class="app-header__section" :title="t('nav.creation')">
          {{ t('nav.creation') }}
        </span>
        <nav v-else class="app-header__nav" :aria-label="t('nav.home')">
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
        <button
          v-if="!creationCenter"
          type="button"
          class="app-header__cta-lingyue"
          @click="openLingyue({ target: 'home' })"
        >
          {{ t('nav.lingyue') }}
        </button>
        <NuxtLink
          v-if="!creationCenter"
          :to="localePath('/creation')"
          class="app-header__cta-creation"
        >
          {{ t('nav.creation') }}
        </NuxtLink>
        <NuxtLink v-else :to="localePath('/')" class="app-header__home">
          {{ t('creation.portalHome') }}
        </NuxtLink>
        <template v-if="auth.isLoggedIn">
          <APopover v-model:open="userMenuOpen" trigger="click" placement="bottomRight">
            <template #content>
              <button type="button" class="app-header__user-logout" @click="handleLogout">
                {{ t('common.logout') }}
              </button>
            </template>
            <button type="button" class="app-header__user" aria-haspopup="dialog">
              <AccountAvatar v-if="auth.user" :avatar-code="auth.user.avatarCode" />
              <span>{{ auth.user?.nickname || t('academy.account') }}</span>
            </button>
          </APopover>
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

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--ic-z-index-sticky, 100);
  background: #fff;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    height: 66px;
  }

  &__leading {
    display: flex;
    align-items: center;
    gap: 60px;
    min-width: 0;
  }

  &--creation &__leading {
    gap: 24px;
  }

  &__brand {
    flex: none;
    color: var(--ic-color-academy-text-primary);
    font-size: 22px;
    font-weight: 600;
    line-height: 35px;
    white-space: nowrap;
  }

  &__section {
    min-width: 0;
    padding-inline-start: 24px;
    overflow: hidden;
    border-inline-start: 1px solid rgb(0 0 0 / 20%);
    font-size: 18px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__home {
    padding: 6px 12px;
    border-radius: 6px;
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);
    font-size: 14px;
    white-space: nowrap;
  }

  &__logo {
    display: block;
    width: 130.034px;
    height: 30px;
    mask: url('/home/figma/c86ca.svg') center / contain no-repeat;

    img {
      display: block;
    }
  }

  &__nav {
    display: none;
    align-items: center;
    gap: 24px;

    &:lang(en-US) {
      gap: 0;
    }
  }

  &__link {
    display: inline-flex;
    align-items: center;
    height: 32px;
    min-width: 80px;
    justify-content: center;
    padding: 0 12px;
    border-radius: 3px;
    color: var(--ic-color-academy-text-primary);
    font-size: 14px;
    line-height: 20px;
    white-space: nowrap;

    &--active {
      color: var(--ic-color-academy-primary);
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-inline-start: auto;
  }

  &__cta-lingyue,
  &__cta-creation {
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

  &__cta-lingyue {
    border: 0;
    background: linear-gradient(109deg, #0079ff 0%, #a348f3 100%);
    color: #fff;
    cursor: pointer;
  }

  &__cta-creation {
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);
    cursor: pointer;
  }

  &__login {
    flex-shrink: 0;
    height: 32px;
    padding: 0 12px;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: var(--ic-color-academy-text-primary);
    font-size: 14px;
    line-height: 20px;
    white-space: nowrap;
    cursor: pointer;
  }

  &__user {
    display: none;
    align-items: center;
    gap: 8px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ic-color-academy-text-primary);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }

  &__user-logout {
    min-width: 96px;
    padding: 4px 8px;
    border: 0;
    background: transparent;
    color: var(--ic-color-academy-text-primary);
    font: inherit;
    font-size: 14px;
    line-height: 22px;
    text-align: start;
    cursor: pointer;

    &:hover {
      color: var(--ic-color-semantic-error, #dc2626);
    }
  }

  &__logout {
    display: none;
  }

  &__burger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border: 0;
    background: transparent;
    color: var(--ic-color-academy-text-primary);
    cursor: pointer;

    svg {
      width: 20px;
      height: 20px;
    }
  }
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

.app-header {
  &__burger {
    &:focus-visible {
      outline: 2px solid var(--ic-color-brand-500, #2563eb);
      outline-offset: 2px;
    }
  }
}

@media (max-width: 767px) {
  .app-header {
    &__leading {
      gap: 12px;
    }

    &--creation &__leading {
      gap: 12px;
    }

    &__section {
      padding-inline-start: 12px;
      font-size: 15px;
    }

    &__home {
      display: none;
    }

    &__inner {
      gap: 8px;
    }

    &__actions {
      gap: 4px;
    }

    &__login {
      padding-inline: 8px;
      display: none;
    }

    &__burger {
      width: 36px;
    }
  }
}

@media (max-width: 1279px) {
  .app-header {
    &__logout {
      display: inline-flex;
      align-items: center;
    }

    &__login {
      padding-inline: 8px;
      display: none;
    }
  }
}

@media (min-width: 1280px) {
  .app-header {
    &__nav,
    &__cta-lingyue,
    &__cta-creation,
    &__user {
      display: inline-flex;
    }

    &__burger {
      display: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-panel-enter-active,
  .header-panel-leave-active {
    transition: none;
  }
}
</style>
