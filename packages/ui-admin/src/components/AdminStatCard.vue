<script setup lang="ts">
import { Card as ACard, Statistic as AStatistic } from 'antdv-next'

interface Props {
  title: string
  value: number | string
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <ACard :bordered="false" class="admin-stat-card">
    <AStatistic :title="title" :value="value" :loading="loading" />
  </ACard>
</template>

<style scoped>
.admin-stat-card {
  height: 100%;
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));
}
</style>
