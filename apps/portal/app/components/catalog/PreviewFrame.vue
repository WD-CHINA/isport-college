<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="preview-frame" :aria-label="title">
    <div class="preview-frame__toolbar">
      <span>{{ title }}</span>
    </div>
    <div class="preview-frame__content"><slot /></div>
  </section>
</template>

<style lang="scss" scoped>
.preview-frame {
  overflow: hidden;
  border: 1px solid var(--ic-color-academy-border-panel);
  border-radius: 12px;
  background: #f1f5f9;

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
    background: #fff;
  }

  &__content {
    min-width: 0;
    overflow: auto;
    padding: 12px;
  }
}
</style>
