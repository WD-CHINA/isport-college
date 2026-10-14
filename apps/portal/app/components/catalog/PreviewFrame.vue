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

<style scoped>
.preview-frame {
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #f1f5f9;
}

.preview-frame__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: #fff;
}

.preview-frame__content {
  min-width: 0;
  overflow: auto;
  padding: 12px;
}
</style>
