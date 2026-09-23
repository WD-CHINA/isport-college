<script setup lang="ts">
import { Button as AButton, Alert as AAlert } from 'antdv-next'
import AccountAvatar from '~/components/auth/AccountAvatar.vue'
import ProfileForm from '~/components/auth/ProfileForm.vue'

const auth = useAuthStore()
const { t } = useI18n()
const { pending, error, save } = useProfile()
const editing = shallowRef(false)
const saved = shallowRef(false)
const maskedPhone = computed(
  () => auth.user?.phone?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') ?? '',
)
function startEditing() {
  editing.value = true
  saved.value = false
}
async function submit(value: { nickname: string; avatar: string }) {
  saved.value = false
  if (await save(value)) {
    editing.value = false
    saved.value = true
  }
}
</script>

<template>
  <section v-if="auth.user" class="account-profile">
    <header class="account-profile__head">
      <AccountAvatar :avatar="auth.user.avatar" />
      <div class="account-profile__ident">
        <h2>{{ auth.user.name || t('academy.anonymous') }}</h2>
        <p>{{ t('academy.phone') }}：{{ maskedPhone }}</p>
      </div>
      <AButton v-if="!editing" class="account-profile__edit" @click="startEditing">
        {{ t('common.edit') }}
      </AButton>
    </header>
    <AAlert v-if="saved" type="success" show-icon :title="t('account.saved')" />
    <div v-if="editing" class="account-profile__form">
      <ProfileForm :user="auth.user" :pending="pending" :error="error" @save="submit" />
      <AButton :disabled="pending" @click="editing = false">{{ t('common.cancel') }}</AButton>
    </div>
  </section>
</template>

<style scoped>
.account-profile {
  padding: 24px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-xl, 14px);
  background: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));
}

.account-profile__head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.account-profile__ident {
  flex: 1;
  min-width: 0;
}

.account-profile__ident h2 {
  margin: 0 0 4px;
  font-size: var(--ic-font-size-xl, 20px);
}

.account-profile__ident p {
  margin: 0;
  color: var(--ic-color-text-secondary, #64748b);
  font-size: var(--ic-font-size-sm, 14px);
}

.account-profile__form {
  display: grid;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--ic-color-border-base, #e2e8f0);
}
</style>
