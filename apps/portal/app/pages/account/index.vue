<script setup lang="ts">
import AccountFeature from '~/components/features/account/AccountFeature.vue'
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
  <AccountFeature v-if="auth.user" :key="auth.user.id" />
</template>
