<script setup lang="ts">
const { t } = useI18n()
const offline = shallowRef(false)
function update() {
  offline.value = !navigator.onLine
}
onMounted(() => {
  update()
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
})
onScopeDispose(() => {
  if (!import.meta.client) return
  window.removeEventListener('online', update)
  window.removeEventListener('offline', update)
})
</script>

<template>
  <p v-if="offline" class="app-network-status" role="alert">
    {{ t('academy.networkOffline') }}
  </p>
</template>

<style scoped lang="scss">
.app-network-status {
  position: fixed;
  z-index: 110;
  top: 66px;
  right: 0;
  left: 0;
  margin: 0;
  padding: 10px 16px;
  background: #fff7ed;
  color: #9a3412;
  box-shadow: 0 2px 6px rgb(0 0 0 / 8%);
  font-size: 14px;
  line-height: 22px;
  text-align: center;
}
</style>
