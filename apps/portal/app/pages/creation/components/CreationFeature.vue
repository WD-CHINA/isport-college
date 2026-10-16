<script setup lang="ts">
import CreationHero from './CreationHero.vue'
import CreationWorks from './CreationWorks.vue'
import CreationPoints from './CreationPoints.vue'
import CreationContent from './CreationContent.vue'
import type { CreationContentType } from '../utils/content-types'
import { CREATION_CONTENT_REWARDS } from '../utils/content-types'
import { CREATION_DEMO_POINTS, type CreationDemoWork } from '../utils/creation-demo'

const { t } = useI18n()
const dialog = shallowRef<'upload' | 'works' | 'points' | 'rewards' | 'work' | null>(null)
const selectedType = shallowRef<CreationContentType | null>(null)
const selectedWork = shallowRef<CreationDemoWork | null>(null)
const dialogOpen = computed({
  get: () => dialog.value !== null,
  set: (open: boolean) => {
    if (!open) dialog.value = null
  },
})
const dialogTitle = computed(() => {
  if (dialog.value === 'works') return t('creation.myWorksCard.title')
  if (dialog.value === 'points') return t('creation.pointsCard.viewDetail')
  if (dialog.value === 'rewards') return t('creation.overview.redeem')
  if (dialog.value === 'work' && selectedWork.value)
    return t(`creation.overview.demoWorks.${selectedWork.value.titleKey}`)
  return selectedType.value
    ? t(`creation.overview.typeNames.${selectedType.value}`)
    : t('creation.submission.selectType')
})

function openUpload(type: CreationContentType | null = null) {
  selectedType.value = type
  dialog.value = 'upload'
}

function previewWork(work: CreationDemoWork) {
  selectedWork.value = work
  dialog.value = 'work'
}
</script>

<template>
  <div class="creation-feature">
    <CreationHero @upload="openUpload()" />
    <div class="creation-feature__body">
      <div class="creation-feature__overview">
        <CreationWorks @view-all="dialog = 'works'" @preview="previewWork" />
        <CreationPoints @details="dialog = 'points'" @redeem="dialog = 'rewards'" />
      </div>
      <CreationContent @select="openUpload" />
    </div>
    <AModal v-model:open="dialogOpen" :title="dialogTitle" :footer="null" :width="680" centered>
      <CreationWorks v-if="dialog === 'works'" in-dialog @preview="previewWork" />
      <div v-else-if="dialog === 'points' || dialog === 'rewards'" class="creation-feature__notice">
        <dl class="creation-feature__point-details">
          <div>
            <dt>{{ t('creation.pointsCard.current') }}</dt>
            <dd>{{ CREATION_DEMO_POINTS.balance }}</dd>
          </div>
          <div>
            <dt>{{ t('creation.pointsCard.monthGain') }}</dt>
            <dd>+{{ CREATION_DEMO_POINTS.monthGain }}</dd>
          </div>
          <div>
            <dt>{{ t('creation.pointsCard.monthSpend') }}</dt>
            <dd>−{{ CREATION_DEMO_POINTS.monthSpend }}</dd>
          </div>
        </dl>
        <p>{{ t('creation.overview.demoNotice') }}</p>
      </div>
      <div v-else-if="dialog === 'work' && selectedWork" class="creation-feature__notice">
        <p>
          {{ t(`creation.overview.typeNames.${selectedWork.type}`) }} ·
          {{ t('creation.overview.demoDate') }}
        </p>
        <p>{{ t('creation.overview.demoNotice') }}</p>
      </div>
      <template v-else-if="dialog === 'upload'">
        <CreationContent v-if="!selectedType" compact @select="selectedType = $event" />
        <div v-else class="creation-feature__notice">
          <p>{{ t(`creation.overview.types.${selectedType}`) }}</p>
          <p>{{ t('creation.declaration') }}</p>
          <p>
            {{ t('creation.overview.reward', { count: CREATION_CONTENT_REWARDS[selectedType] }) }}
          </p>
          <p>{{ t('creation.overview.demoNotice') }}</p>
          <AButton @click="selectedType = null">{{ t('creation.submission.changeType') }}</AButton>
        </div>
      </template>
    </AModal>
  </div>
</template>

<style lang="scss" scoped>
.creation-feature {
  &__body {
    display: grid;
    width: min(1200px, calc(100% - 48px));
    gap: 72px;
    margin-inline: auto;
    padding-block: 48px 36px;
  }

  &__overview {
    display: grid;
    grid-template-columns: minmax(0, 816fr) minmax(0, 360fr);
    gap: 24px;
  }

  &__notice {
    padding-block: 16px;
    font-size: 14px;
    line-height: 24px;

    p {
      margin: 0 0 16px;
    }
  }

  &__point-details {
    display: grid;
    gap: 16px;
    margin: 0 0 24px;

    div {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }

    dd {
      margin: 0;
      font-weight: 600;
    }
  }
}

@media (max-width: 767px) {
  .creation-feature {
    &__body {
      width: calc(100% - 32px);
      gap: 24px;
      padding-block: 24px;
    }

    &__overview {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
