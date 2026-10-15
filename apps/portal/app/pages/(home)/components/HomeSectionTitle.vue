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

@media (max-width: 767px) {
  .home-section-title {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 8px 12px;

    > div {
      display: contents;
    }

    h2 {
      grid-column: 1;
      font-size: 22px;
      line-height: 30px;
      overflow-wrap: anywhere;
    }

    p {
      grid-column: 1 / -1;
      grid-row: 2;
      margin: 0;
      font-size: 12px;
      line-height: 20px;
    }

    a {
      grid-column: 2;
      grid-row: 1;
      max-width: 100px;
      margin-top: 3px;
      font-size: 12px;
      line-height: 22px;
      white-space: normal;
      text-align: end;
    }
  }
}
</style>
