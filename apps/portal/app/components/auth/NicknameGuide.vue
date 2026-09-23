<script setup lang="ts">
import { Button as AButton, Modal as AModal } from 'antdv-next'
const auth = useAuthStore()
const { t } = useI18n()
const { pending, error, save } = useProfile()
async function submit(value: { nickname: string; avatar: string }) {
  if (await save(value)) auth.nicknameGuideVisible = false
}
</script>

<template>
  <AModal
    v-model:open="auth.nicknameGuideVisible"
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
    <AButton class="mt-4" type="text" @click="auth.nicknameGuideVisible = false">{{
      t('academy.skip')
    }}</AButton>
  </AModal>
</template>
