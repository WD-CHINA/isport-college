<script setup lang="ts">
defineProps<{ total: number; pageSize: number; page: number }>()
const emit = defineEmits<{ change: [page: number] }>()
</script>

<template>
  <APagination
    class="app-pagination"
    :current="page"
    :total="total"
    :page-size="pageSize"
    :show-size-changer="false"
    hide-on-single-page
    responsive
    @change="value => emit('change', value)"
  />
</template>

<style lang="scss" scoped>
.app-pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 28px;
}
</style>
