<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { useAccountProfile } from '../composables/useAccountProfile'
import AccountAvatar from '~/components/auth/AccountAvatar.vue'
import ProfileForm from '~/components/auth/ProfileForm.vue'
import AvatarPicker from './AvatarPicker.vue'

const { t } = useI18n()
const [messageApi, ContextHolder] = message.useMessage()
const {
  user,
  pending,
  error,
  editing,
  choosingAvatar,
  avatarRequest,
  startEditing,
  openAvatars,
  submit,
  chooseAvatar,
  logout,
} = useAccountProfile(() => messageApi.success(t('account.saved')))
const {
  data: avatars,
  status: avatarStatus,
  error: avatarError,
  execute: loadAvatars,
} = avatarRequest
useMessageFeedback(
  messageApi,
  () => choosingAvatar.value && error.value,
  () => error.value,
)
</script>

<template>
  <section v-if="user" class="account-profile" :aria-label="t('account.profile')">
    <ContextHolder />
    <button
      class="account-profile__avatar"
      type="button"
      :aria-label="t('academy.avatar')"
      :disabled="pending"
      @click="openAvatars"
    >
      <AccountAvatar :avatar-code="user.avatarCode" />
      <span class="account-profile__avatar-edit" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z" /></svg>
      </span>
    </button>
    <div class="account-profile__ident">
      <h2>{{ user.nickname || t('academy.anonymous') }}</h2>
      <div class="account-profile__field">
        <span class="account-profile__label">{{ t('academy.phone') }}</span>
        <span>{{ user.phoneMask }}</span>
      </div>
      <div class="account-profile__field account-profile__nickname">
        <span class="account-profile__label">{{ t('academy.nickname') }}</span>
        <ProfileForm
          v-if="editing"
          :user="user"
          :pending="pending"
          :error="error"
          inline
          @save="submit"
        >
          <template #actions>
            <AButton html-type="button" :disabled="pending" @click="editing = false">{{
              t('common.cancel')
            }}</AButton>
          </template>
        </ProfileForm>
        <template v-else>
          <span>{{ user.nickname || t('academy.anonymous') }}</span>
          <button
            type="button"
            class="account-profile__edit"
            :disabled="pending"
            @click="startEditing"
          >
            {{ t('common.edit') }}
          </button>
        </template>
      </div>
    </div>
    <AButton class="account-profile__logout" @click="logout">{{ t('common.logout') }}</AButton>
    <AvatarPicker
      :open="choosingAvatar"
      :options="avatars"
      :value="user.avatarCode"
      :pending="pending"
      :loading="avatarStatus === 'pending'"
      :failed="Boolean(avatarError)"
      @cancel="choosingAvatar = false"
      @retry="loadAvatars()"
      @confirm="chooseAvatar"
    />
  </section>
</template>

<style lang="scss" scoped>
.account-profile {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 32px;
  min-height: 200px;
  padding: 40px 32px 28px;
  border: 1px solid var(--ic-color-academy-border-panel);
  border-radius: 12px;
  background: var(--ic-color-background-container);
  color: var(--ic-color-academy-text-primary);

  &__avatar {
    position: relative;
    flex: none;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;

    :deep(.account-avatar) {
      width: 80px;
      height: 80px;
    }
  }

  &__avatar-edit {
    position: absolute;
    right: 0;
    bottom: 0;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 2px solid #fff;
    border-radius: 50%;
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);

    svg {
      width: 14px;
      height: 14px;
      stroke: currentcolor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  &__ident {
    flex: 1;
    min-width: 0;
  }

  h2 {
    margin: 0 140px 14px 0;
    font-size: 24px;
    line-height: 36px;
    overflow-wrap: anywhere;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 24px;
    min-height: 24px;
    font-size: 15px;
    line-height: 24px;
  }

  &__label {
    flex: 0 0 48px;
    color: var(--ic-color-academy-text-caption);
    font-size: 13px;
  }

  &__nickname {
    position: relative;
    margin-top: 20px;
    align-items: flex-start;
  }

  &__nickname :deep(.profile-form--inline) {
    position: absolute;
    top: -10px;
    left: 72px;
    width: calc(100% - 72px);
  }

  &__nickname > span:not(.account-profile__label) {
    overflow-wrap: anywhere;
  }

  &__edit {
    flex: none;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ic-color-academy-primary);
    font-size: 13px;
    line-height: 24px;
    cursor: pointer;
  }

  &__logout {
    position: absolute;
    top: 28px;
    right: 32px;
    height: 40px;
    padding: 0 28px;
    border: 0;
    border-radius: 6px;
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);
    box-shadow: none;
  }

  button:focus-visible {
    outline: 2px solid var(--ic-color-academy-primary);
    outline-offset: 4px;
  }
}

@media (max-width: 767px) {
  .account-profile {
    gap: 16px;
    padding: 24px 20px;
    flex-wrap: wrap;

    &__avatar :deep(.account-avatar) {
      width: 64px;
      height: 64px;
    }

    h2 {
      margin-right: 0;
      font-size: 20px;
      line-height: 30px;
    }

    &__ident {
      flex-basis: calc(100% - 80px);
    }

    &__field {
      gap: 12px;
      flex-wrap: wrap;
      font-size: 14px;
    }

    &__nickname {
      margin-top: 12px;
    }

    &__nickname :deep(.profile-form--inline) {
      position: static;
      width: 100%;
    }

    &__logout {
      position: static;
      margin-left: auto;
      height: 36px;
      padding-inline: 16px;
    }
  }
}
</style>
