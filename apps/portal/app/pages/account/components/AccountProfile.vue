<script setup lang="ts">
import { message } from 'antdv-next'
import { useProfile } from '~/composables/useProfile'
import { useAuthStore } from '~/stores/auth'
import AccountAvatar from '~/components/auth/AccountAvatar.vue'
import ProfileForm from '~/components/auth/ProfileForm.vue'

const auth = useAuthStore()
const { t } = useI18n()
const { pending, error, save } = useProfile()
const editing = shallowRef(false)
const [messageApi, ContextHolder] = message.useMessage()
const maskedPhone = computed(() => auth.user?.phoneMask ?? '')
function startEditing() {
  editing.value = true
}
async function submit(value: { nickname: string }) {
  if (await save(value)) {
    editing.value = false
    messageApi.success(t('account.saved'))
  }
}
</script>

<template>
  <section v-if="auth.user" class="account-profile">
    <ContextHolder />
    <header class="account-profile__head">
      <AccountAvatar :avatar-code="auth.user.avatarCode" />
      <div class="account-profile__ident">
        <h2>{{ auth.user.nickname || t('academy.anonymous') }}</h2>
        <p>{{ t('academy.phone') }}：{{ maskedPhone }}</p>
      </div>
      <AButton v-if="!editing" class="account-profile__edit" @click="startEditing">
        {{ t('common.edit') }}
      </AButton>
    </header>
    <div v-if="editing" class="account-profile__form">
      <ProfileForm :user="auth.user" :pending="pending" :error="error" @save="submit" />
      <AButton :disabled="pending" @click="editing = false">{{ t('common.cancel') }}</AButton>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.account-profile {
  padding: 24px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-xl, 14px);
  background: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));

  &__head {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__ident {
    flex: 1;
    min-width: 0;

    h2 {
      margin: 0 0 4px;
      font-size: var(--ic-font-size-xl, 20px);
    }

    p {
      margin: 0;
      color: var(--ic-color-text-secondary, #64748b);
      font-size: var(--ic-font-size-sm, 14px);
    }
  }

  &__form {
    display: grid;
    gap: 16px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--ic-color-border-base, #e2e8f0);
  }
}
</style>
