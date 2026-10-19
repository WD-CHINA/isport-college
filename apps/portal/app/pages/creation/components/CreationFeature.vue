<script setup lang="ts">
import { message } from 'antdv-next'
import CreationHero from './CreationHero.vue'
import CreationWorks from './CreationWorks.vue'
import CreationPoints from './CreationPoints.vue'
import CreationContent from './CreationContent.vue'

const { t } = useI18n()
const [messageApi, ContextHolder] = message.useMessage()
function comingSoon() {
  messageApi.info({ key: 'creation-coming-soon', content: t('creation.comingSoon') })
}
</script>

<template>
  <div class="creation-feature">
    <ContextHolder />
    <CreationHero @upload="comingSoon" />
    <div class="creation-feature__body">
      <div class="creation-feature__overview">
        <CreationWorks @view-all="comingSoon" @preview="comingSoon" />
        <CreationPoints @details="comingSoon" @redeem="comingSoon" />
      </div>
      <CreationContent @select="comingSoon" />
    </div>
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
