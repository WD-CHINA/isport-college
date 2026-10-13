<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; more?: string; to?: string }>()
</script>

<template>
  <div class="home-section-title">
    <div>
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <NuxtLink v-if="to && more" :to="to">{{ more }} <span aria-hidden="true">›</span></NuxtLink>
  </div>
</template>

<style scoped>
.home-section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.home-section-title h2 {
  margin: 0;
  color: #1c1f23;
  font-size: 28px;
  font-weight: 600;
  line-height: 45px;
}

.home-section-title p {
  margin: 6px 0 0;
  color: #68788c;
  font-size: 14px;
  line-height: 22px;
}

.home-section-title a {
  flex: none;
  color: #0077fa;
  font-size: 14px;
  font-weight: 500;
  line-height: 32px;
  white-space: nowrap;
}
</style>
