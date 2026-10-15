<script setup lang="ts">
import { ACADEMY_CAPABILITIES } from '~/config/capabilities'
import HomeSectionTitle from './HomeSectionTitle.vue'
const { t } = useI18n()
</script>
<template>
  <section class="home-creation">
    <div class="container-page">
      <div class="home-creation__head">
        <HomeSectionTitle :title="t('home.creationTitle')" :subtitle="t('home.creationSubtitle')" />
        <button
          class="home-creation__entry"
          type="button"
          :disabled="!ACADEMY_CAPABILITIES.creation.enabled"
          :title="t('academy.unavailable')"
        >
          <img src="/home/figma/b82c6.svg" alt="" />
          <strong>{{ t('home.enterCreation') }}</strong>
          <img src="/home/figma/14685.svg" alt="" />
        </button>
      </div>
      <div class="home-creation__unavailable" role="status">
        <p>{{ t('academy.unavailable') }}</p>
        <span>{{ t('home.creationHint') }}</span>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.home-creation {
  padding: 48px 0;
  background: var(--ic-color-academy-background-section);

  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 36px;
  }

  &__entry {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(
      105deg,
      var(--ic-color-academy-media-accent),
      var(--ic-color-academy-primary)
    );
    color: #fff;
    cursor: not-allowed;

    img {
      display: block;
      flex: none;
    }

    strong {
      margin-right: 12px;
      font-size: 18px;
      font-weight: 500;
      line-height: 28px;
    }
  }

  &__unavailable {
    display: flex;
    min-height: 224px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 36px;
    padding: 24px;
    border: 1px solid var(--home-color-border);
    border-radius: 12px;
    background: #fff;
    color: var(--home-color-muted);
    text-align: center;

    p {
      margin: 0;
      font-size: 16px;
    }

    span {
      font-size: 13px;
    }
  }
}

@media (max-width: 960px) {
  .home-creation {
    &__head {
      align-items: flex-start;
      flex-direction: column;
      gap: 24px;
    }
  }
}
</style>
