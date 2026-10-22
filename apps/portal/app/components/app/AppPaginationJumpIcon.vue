<script setup lang="ts">
defineProps<{ direction: 'prev' | 'next' }>()
</script>

<template>
  <a class="ant-pagination-item-link" aria-hidden="true">
    <div class="ant-pagination-item-container">
      <span class="ant-pagination-item-link-icon">
        <svg viewBox="0 0 18 16" width="1em" height="1em" fill="none" focusable="false">
          <path
            :d="direction === 'prev' ? 'm8 3-5 5 5 5m7-10-5 5 5 5' : 'm3 3 5 5-5 5m7-10 5 5-5 5'"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="ant-pagination-item-ellipsis">
        <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" focusable="false">
          <path
            d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"
          />
        </svg>
      </span>
    </div>
  </a>
</template>
