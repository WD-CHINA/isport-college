<script setup lang="ts">
import ProfileForm from '~/components/auth/ProfileForm.vue'
import { useProfile } from '~/composables/account/useProfile'
import { useLoginUiStore } from '~/stores/login-ui'
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const loginUi = useLoginUiStore()
const { t } = useI18n()
const { pending, error, save, skipNickname } = useProfile()
async function submit(value: { nickname: string; avatarCode: number }) {
  if (await save(value)) loginUi.nicknameGuideVisible = false
}
async function skip() {
  if (await skipNickname()) loginUi.nicknameGuideVisible = false
}
</script>

<template>
  <AModal
    v-model:open="loginUi.nicknameGuideVisible"
    :title="t('academy.nicknameGuide')"
    :footer="null"
    :width="440"
    centered
    destroy-on-hidden
  >
    <ProfileForm
      v-if="auth.user"
      :user="auth.user"
      :pending="pending"
      :error="error"
      @save="submit"
    />
    <AButton class="mt-4" type="text" :disabled="pending" @click="skip">{{
      t('academy.skip')
    }}</AButton>
  </AModal>
</template>
