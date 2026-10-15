<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; more?: string; to?: string; moreIcon?: string }>()
</script>

<template>
  <div class="home-section-title">
    <div>
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <NuxtLink v-if="to && more" :to="to"
      >{{ more }} <img :src="moreIcon || '/home/figma/2ae72.svg'" alt=""
    /></NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.home-section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;

  h2 {
    margin: 0;
    color: var(--ic-color-academy-text-primary);
    font-size: 28px;
    font-weight: 600;
    line-height: 45px;
  }

  p {
    margin: 6px 0 0;
    color: var(--ic-color-academy-text-muted);
    font-size: 14px;
    line-height: 22px;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex: none;
    color: var(--ic-color-academy-primary);
    font-size: 14px;
    font-weight: 500;
    line-height: 32px;
    white-space: nowrap;
  }

  img {
    display: block;
    flex: none;
  }
}

@media (max-width: 560px) {
  .home-section-title {
    align-items: flex-start;
    gap: 16px;

    h2 {
      font-size: 24px;
      line-height: 36px;
    }

    a {
      white-space: normal;
    }
  }
}
</style>
