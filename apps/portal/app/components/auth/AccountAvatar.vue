<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <span class="account-avatar" role="img" :aria-label="t('academy.defaultAvatar')">
    <img src="/auth/default-avatar.png" alt="" width="32" height="32" />
  </span>
</template>

<style lang="scss" scoped>
.account-avatar {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 50%;

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }
}
</style>
