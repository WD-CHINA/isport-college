<script setup lang="ts">
import TeacherProfileForm from '~/components/features/account/TeacherProfileForm.vue'
definePageMeta({ middleware: ['auth'] })
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
