<script setup lang="ts">
const emit = defineEmits<{ upload: [] }>()
const { t } = useI18n()
</script>

<template>
  <section class="creation-hero">
    <div class="creation-hero__inner">
      <h1 class="creation-hero__title">{{ t('creation.hero.title') }}</h1>
      <p class="creation-hero__description">{{ t('creation.hero.desc') }}</p>
      <button type="button" class="creation-hero__upload" @click="emit('upload')">
        <img class="creation-hero__upload-icon" src="/creation/ardot/upload.svg" alt="" />
        {{ t('creation.overview.upload') }}
        <img class="creation-hero__upload-arrow" src="/creation/ardot/arrow-right.svg" alt="" />
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.creation-hero {
  min-height: 400px;
  background: #e7f5ff url('/creation/ardot/creation-hero.png') center / cover no-repeat;

  &__inner {
    width: min(1200px, calc(100% - 48px));
    margin-inline: auto;
    padding-block: 81px;
  }

  &__title {
    margin: 0 0 16px;
    font-size: 36px;
    font-weight: 600;
    line-height: 72px;
  }

  &__description {
    max-width: 540px;
    margin: 0;
    color: rgb(28 31 35 / 80%);
    font-size: 16px;
    line-height: 24px;
  }

  &__upload {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: 48px;
    padding: 12px 16px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(110deg, #2cb8c5, #0077fa);
    color: #fff;
    font-size: 18px;
    font-weight: 500;
    line-height: 30px;
    cursor: pointer;

    &:hover {
      filter: brightness(1.05);
    }

    &:focus-visible {
      outline: 2px solid var(--ic-color-academy-primary, #0077fa);
      outline-offset: 4px;
    }
  }

  &__upload-icon {
    width: 30px;
    height: 30px;
  }

  &__upload-arrow {
    width: 20px;
    height: 20px;
    margin-inline-start: 12px;
  }
}

@media (max-width: 1023px) {
  .creation-hero {
    background-position: left center;

    &__title {
      max-width: 600px;
      font-size: 30px;
      line-height: 1.5;
    }
  }
}

@media (max-width: 767px) {
  .creation-hero {
    min-height: 340px;
    background-position: 20% center;

    &__inner {
      width: calc(100% - 32px);
      padding-block: 44px;
    }

    &__title {
      font-size: 28px;
    }

    &__description {
      font-size: 14px;
      line-height: 24px;
    }

    &__upload {
      margin-top: 28px;
      font-size: 16px;
    }
  }
}
</style>
