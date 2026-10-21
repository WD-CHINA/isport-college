<script setup lang="ts">
import AccountAvatar from '~/components/auth/AccountAvatar.vue'
import { useLingyueLaunch } from '~/composables/useLingyueLaunch'

defineProps<{
  items: { to: string; label: string; active: boolean; icon: string }[]
  loggedIn: boolean
  nickname?: string
  avatarCode?: number
}>()
const emit = defineEmits<{ close: []; login: []; logout: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const { openLingyue } = useLingyueLaunch()
function openLingyueHome() {
  emit('close')
  openLingyue({ target: 'home' })
}
</script>

<template>
  <nav class="app-header__panel" :aria-label="t('common.menu')">
    <p class="app-header__panel-heading">{{ t('footer.navigation') }}</p>
    <div class="app-header__panel-nav">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="app-header__panel-link"
        :class="{ 'app-header__panel-link--active': item.active }"
        :aria-current="item.active ? 'page' : undefined"
        @click="emit('close')"
      >
        <span class="app-header__panel-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path :d="item.icon" />
          </svg>
        </span>
        <span class="app-header__panel-label">{{ item.label }}</span>
        <svg class="app-header__panel-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </NuxtLink>
    </div>

    <div class="app-header__panel-tools">
      <button
        type="button"
        class="app-header__panel-tool app-header__panel-lingyue"
        @click="openLingyueHome"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3ZM20 3v4m-2-2h4" />
        </svg>
        <span>{{ t('nav.lingyue') }}</span>
      </button>
      <NuxtLink
        :to="localePath('/creation')"
        class="app-header__panel-tool app-header__panel-creation"
        @click="emit('close')"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M16 3l5 5M9 15l1-5 7-7 4 4-7 7-5 1Z"
          />
        </svg>
        <span>{{ t('nav.creation') }}</span>
      </NuxtLink>
    </div>

    <div class="app-header__panel-account">
      <template v-if="loggedIn">
        <NuxtLink
          :to="localePath('/account')"
          class="app-header__panel-profile"
          @click="emit('close')"
        >
          <AccountAvatar :avatar-code="avatarCode" />
          <span>
            <strong>{{ nickname || t('academy.account') }}</strong>
            <small v-if="nickname">{{ t('academy.account') }}</small>
          </span>
        </NuxtLink>
        <button
          type="button"
          class="app-header__panel-logout"
          :aria-label="t('common.logout')"
          :title="t('common.logout')"
          @click="emit('logout')"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M10 12h11m-4-4 4 4-4 4" />
          </svg>
        </button>
      </template>
      <button v-else type="button" class="app-header__panel-login" @click="emit('login')">
        {{ t('common.login') }}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12h16m-6-6 6 6-6 6" />
        </svg>
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.app-header__panel {
  position: absolute;
  top: calc(100% + 8px);
  right: max(12px, calc((100% - 1200px) / 2));
  width: min(380px, calc(100% - 24px));
  max-height: calc(100dvh - 90px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: 20px;
  background: var(--ic-color-background-elevated, #fff);
  box-shadow: 0 20px 56px -16px rgb(15 23 42 / 24%);

  &-heading {
    margin: 0 0 10px;
    padding-inline: 10px;
    color: var(--ic-color-text-secondary, #475569);
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
  }

  &-nav {
    display: grid;
    gap: 4px;
  }

  &-link {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 52px;
    padding: 8px 12px;
    border-radius: 12px;
    color: var(--ic-color-text-primary, #0f172a);
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;

    &--active {
      background: var(--ic-color-brand-50, #eff6ff);
      color: var(--ic-color-brand-600, #1d4ed8);
      font-weight: 600;
    }
  }

  &-icon {
    display: grid;
    flex: 0 0 32px;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--ic-color-background-page, #f8fafc);
    color: var(--ic-color-text-secondary, #475569);
  }

  &-link {
    &--active .app-header__panel-icon {
      background: var(--ic-color-background-container, #fff);
      color: inherit;
    }
  }

  &-label {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  svg {
    width: 20px;
    height: 20px;
    flex: none;
    stroke: currentcolor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .app-header__panel-arrow {
    width: 16px;
    height: 16px;
    color: var(--ic-color-text-tertiary, #94a3b8);
  }

  &-link {
    &--active .app-header__panel-arrow {
      color: inherit;
    }
  }

  &-tools {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--ic-color-border-base, #e2e8f0);
  }

  &-tool {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    align-items: center;
    gap: 8px;
    min-height: 88px;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;

    > span {
      width: 100%;
      overflow-wrap: anywhere;
    }
  }

  &-lingyue {
    width: 100%;
    background: linear-gradient(120deg, #eff6ff, #f5f0ff);
    color: #5843b5;
    text-align: start;
    cursor: pointer;
  }

  &-creation {
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);
    cursor: pointer;
  }

  &-account {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--ic-color-border-base, #e2e8f0);
  }

  &-profile {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 44px;
    padding: 4px;
    border-radius: 8px;
    color: var(--ic-color-text-primary, #0f172a);

    > span {
      display: grid;
      gap: 2px;
      min-width: 0;
    }

    strong {
      overflow: hidden;
      font-size: 14px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: var(--ic-color-text-secondary, #475569);
      font-size: 12px;
      line-height: 18px;
    }
  }

  &-logout,
  &-login {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 44px;
    border: 0;
    border-radius: 10px;
    font: inherit;
    cursor: pointer;
  }

  &-logout {
    width: 44px;
    flex: none;
    background: var(--ic-color-background-page, #f8fafc);
    color: var(--ic-color-text-secondary, #475569);
  }

  &-login {
    width: 100%;
    background: var(--ic-color-brand-600, #1d4ed8);
    color: var(--ic-color-text-inverse, #fff);
    font-size: 14px;
    font-weight: 600;
  }

  & a:focus-visible,
  & button:focus-visible {
    outline: 2px solid var(--ic-color-brand-500, #2563eb);
    outline-offset: 3px;
  }
}

@media (min-width: 1280px) {
  .app-header__panel {
    display: none;
  }
}
</style>
