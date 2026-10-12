<script setup lang="ts">
import { ACADEMY_CAPABILITIES, type AcademyCapability } from '~/config/capabilities'

const props = defineProps<{ capability: AcademyCapability }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <main class="container-page">
    <AResult
      status="info"
      :title="t(ACADEMY_CAPABILITIES[props.capability].titleKey)"
      :sub-title="t('academy.unavailable')"
    >
      <template #extra>
        <NuxtLink :to="localePath('/')">{{ t('common.backHome') }}</NuxtLink>
      </template>
    </AResult>
  </main>
</template>
