<script setup lang="ts">
import {
  CREATION_CONTENT_GROUPS,
  CREATION_CONTENT_REWARDS,
  type CreationContentType,
} from '../utils/content-types'

const emit = defineEmits<{ select: [type: CreationContentType] }>()
const { t } = useI18n()
</script>

<template>
  <section class="creation-content">
    <div class="creation-content__heading">
      <div>
        <div class="creation-content__title">
          <h2>{{ t('creation.overview.contentTitle') }}</h2>
          <span class="creation-content__limited">{{ t('creation.share.limitedTag') }}</span>
        </div>
        <p>{{ t('creation.overview.contentDescription') }}</p>
      </div>
      <ul class="creation-content__principles">
        <li v-for="key in ['original', 'copyright', 'privacy']" :key="key">
          <img :src="`/creation/ardot/principle-${key}.svg`" alt="" />
          {{ t(`creation.share.${key}`) }}
        </li>
      </ul>
    </div>
    <div class="creation-content__groups">
      <section
        v-for="group in CREATION_CONTENT_GROUPS"
        :key="group.key"
        class="creation-content__group"
      >
        <h3>{{ t(`creation.overview.groups.${group.key}`) }}</h3>
        <div class="creation-content__options">
          <button
            v-for="type in group.types"
            :key="type"
            type="button"
            class="creation-content__option image-zoom card-feedback"
            :class="`creation-content__option--${type}`"
            @click="emit('select', type)"
          >
            <img
              class="creation-content__art image-zoom__image"
              :src="`/creation/ardot/content-${type}.svg`"
              alt=""
            />
            <strong class="card-feedback__title">{{
              t(`creation.overview.typeNames.${type}`)
            }}</strong>
            <small>{{ t(`creation.overview.types.${type}`) }}</small>
            <span class="creation-content__reward">{{
              t('creation.overview.reward', { count: CREATION_CONTENT_REWARDS[type] })
            }}</span>
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.creation-content {
  min-width: 0;
  padding: 23px;
  border: 1px solid rgb(28 31 35 / 10%);
  border-radius: 12px;
  background: #fff;

  &__heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 25px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 32px;
    }

    p {
      margin: 8px 0 0;
      color: rgb(28 31 35 / 60%);
      font-size: 14px;
      line-height: 20px;
    }
  }

  &__title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }

  &__limited {
    padding: 4px 8px;
    border-radius: 3px;
    background: #fff0dc;
    color: #a75400;
    font-size: 12px;
    line-height: 16px;
  }

  &__principles {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 4px 0 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      align-items: center;
      gap: 4px;
      color: rgb(28 31 35 / 60%);
      font-size: 12px;
      line-height: 20px;
    }

    li + li {
      padding-inline-start: 12px;
      border-inline-start: 1px solid #f0f2f5;
    }

    img {
      width: 14px;
      height: 14px;
    }
  }

  &__groups {
    display: grid;
    grid-template-columns: minmax(0, 440fr) minmax(0, 668fr);
    gap: 44px;
  }

  &__group {
    min-width: 0;

    h3 {
      margin: 0 0 16px;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
    }
  }

  &__options {
    display: flex;
    gap: 16px;
  }

  &__option {
    position: relative;
    display: flex;
    min-width: 0;
    height: 140px;
    overflow: hidden;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    border: 0;
    border-radius: 6px;
    background: #e5f7f8;
    color: inherit;
    text-align: start;
    cursor: pointer;

    strong {
      position: relative;
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
    }

    small {
      position: relative;
      margin-top: 6px;
      color: rgb(28 31 35 / 60%);
      font-size: 12px;
      line-height: 20px;
    }

    &:focus-visible {
      outline: 2px solid var(--ic-color-academy-primary, #0077fa);
      outline-offset: 3px;
    }

    &--micro,
    &--lesson,
    &--practice {
      background: #eaf5ff;
    }
  }

  &__art {
    position: absolute;
    top: 59px;
    right: 0;
    width: 100px;
    height: 100px;
    pointer-events: none;
  }

  &__option--demonstration &__art {
    top: 62px;
    right: 6px;
  }

  &__option--lesson &__art {
    top: 64px;
    right: 13px;
    width: 80px;
    height: 80px;
    opacity: 0.2;
  }

  &__option--practice &__art {
    top: 67px;
    right: 11px;
    width: 90px;
    height: 90px;
  }

  &__reward {
    position: absolute;
    bottom: 16px;
    left: 16px;
    padding: 2px 8px;
    border-radius: 3px;
    background: #f80;
    color: #fff;
    font-size: 12px;
    line-height: 16px;
  }

  &:lang(en-US) &__option {
    height: 180px;
  }

  &:lang(en-US) &__art {
    top: auto;
    bottom: -20px;
  }
}

@media (max-width: 1023px) {
  .creation-content__groups {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 479px) {
  .creation-content {
    &__options {
      flex-wrap: wrap;
    }

    &__option {
      flex-basis: calc(50% - 8px);
    }
  }
}
</style>
