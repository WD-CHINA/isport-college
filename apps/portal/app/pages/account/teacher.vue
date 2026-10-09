<script setup lang="ts">
import TeacherProfileForm from '~/components/features/account/TeacherProfileForm.vue'
definePageMeta({ academyGate: { permission: 'account:view' } })
const auth = useAuthStore()
const localePath = useLocalePath()
watch(
  () => auth.isLoggedIn,
  loggedIn => {
    if (!loggedIn) void navigateTo(localePath('/'))
  },
)
</script>

<template>
  <TeacherProfileForm v-if="auth.user" :key="auth.user.id" />
</template>
