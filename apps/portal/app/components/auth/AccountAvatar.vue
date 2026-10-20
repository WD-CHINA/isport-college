<script setup lang="ts">
const props = withDefaults(defineProps<{ avatarCode?: number }>(), { avatarCode: 1 })
const { t } = useI18n()
const failed = shallowRef(false)
const source = computed(() =>
  !failed.value &&
  Number.isInteger(props.avatarCode) &&
  props.avatarCode >= 1 &&
  props.avatarCode <= 8
    ? `/auth/avatars/${props.avatarCode}.png`
    : '/auth/default-avatar.png',
)
watch(
  () => props.avatarCode,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <span
    class="account-avatar"
    role="img"
    :aria-label="
      source === '/auth/default-avatar.png'
        ? t('academy.defaultAvatar')
        : t('account.avatarOption', { code: avatarCode })
    "
  >
    <img :src="source" alt="" width="32" height="32" @error="failed = true" />
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
