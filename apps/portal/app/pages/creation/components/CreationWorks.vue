<script setup lang="ts">
import {
  CREATION_DEMO_COUNTS,
  CREATION_DEMO_WORKS_BY_STATUS,
  type CreationDemoWork,
  type CreationWorkStatus,
} from '../utils/creation-demo'

const emit = defineEmits<{ viewAll: []; preview: [work: CreationDemoWork] }>()
const { t } = useI18n()
const activeKey = shallowRef<CreationWorkStatus>('published')
const tabs = computed(() =>
  (Object.keys(CREATION_DEMO_COUNTS) as CreationWorkStatus[]).map(key => ({
    key,
    label: t('creation.overview.workStatus', {
      status: t(`creation.myWorksCard.${key}`),
      count: CREATION_DEMO_COUNTS[key],
    }),
  })),
)
const works = computed(() => CREATION_DEMO_WORKS_BY_STATUS[activeKey.value])
</script>

<template>
  <section class="creation-works">
    <div class="creation-works__heading">
      <h2>{{ t('creation.myWorksCard.title') }}</h2>
      <button type="button" @click="emit('viewAll')">
        {{ t('creation.myWorksCard.viewAll') }} <span aria-hidden="true">›</span>
      </button>
    </div>
    <ATabs v-model:active-key="activeKey" :items="tabs" :tab-bar-gutter="40" destroy-on-hidden>
      <template #contentRender>
        <ul v-if="works.length" class="creation-works__list">
          <li v-for="work in works" :key="work.id" class="creation-works__row">
            <img
              :src="`/creation/ardot/work-${work.type}.svg`"
              alt=""
              class="creation-works__icon"
            />
            <button type="button" class="creation-works__name" @click="emit('preview', work)">
              {{ t(`creation.overview.demoWorks.${work.titleKey}`) }}
            </button>
            <time :datetime="work.date" class="creation-works__date">{{
              t('creation.overview.demoDate')
            }}</time>
            <ADropdown
              :trigger="['click']"
              :menu="{ items: [{ key: 'preview', label: t('creation.myWorksCard.viewWork') }] }"
              @menu-click="emit('preview', work)"
            >
              <button
                type="button"
                class="creation-works__more"
                :aria-label="
                  t('creation.overview.workActions', {
                    title: t(`creation.overview.demoWorks.${work.titleKey}`),
                  })
                "
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="6" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="18" cy="12" r="1.5" />
                </svg>
              </button>
            </ADropdown>
          </li>
        </ul>
        <div v-else class="creation-works__empty" role="status">
          {{ t(`creation.overview.empty.${activeKey}`) }}
        </div>
      </template>
    </ATabs>
  </section>
</template>

<style lang="scss" scoped>
.creation-works {
  min-width: 0;
  height: 360px;
  min-height: 360px;
  padding: 23px;
  border: 1px solid rgb(28 31 35 / 10%);
  border-radius: 12px;
  background: #fff;

  &__heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 32px;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 0;
      border: 0;
      background: transparent;
      color: rgb(28 31 35 / 80%);
      font-size: 14px;
      cursor: pointer;

      span {
        font-size: 24px;
        line-height: 24px;
      }
    }
  }

  :deep(.ant-tabs-nav) {
    margin-bottom: 26px;
  }

  :deep(.ant-tabs-tab) {
    padding: 0 10px 6px;
    font-size: 15px;
    line-height: 24px;
  }

  &__list {
    display: grid;
    gap: 20px;
    margin: 0;
    padding: 0 16px 0 0;
    list-style: none;
  }

  &__row {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 120px 24px;
    align-items: center;
    gap: 16px;
    min-height: 36px;
  }

  &__icon {
    width: 36px;
    height: 36px;
  }

  &__name {
    padding: 0;
    overflow: hidden;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 14px;
    line-height: 22px;
    text-align: start;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  &__date {
    color: rgb(28 31 35 / 60%);
    font-size: 12px;
    line-height: 20px;
  }

  &__more {
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: rgb(28 31 35 / 60%);
    cursor: pointer;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  &__empty {
    display: grid;
    min-height: 204px;
    place-items: center;
    color: rgb(28 31 35 / 60%);
    font-size: 14px;
  }
}

@media (max-width: 767px) {
  .creation-works {
    height: auto;

    :deep(.ant-tabs-tab) {
      padding-inline: 4px;
      font-size: 14px;
    }

    &__list {
      padding-inline-end: 0;
    }

    &__row {
      grid-template-columns: 36px minmax(0, 1fr) 24px;
      gap: 4px 12px;
    }

    &__icon {
      grid-row: span 2;
    }

    &__date {
      grid-column: 2;
    }

    &__more {
      grid-column: 3;
      grid-row: 1 / span 2;
    }
  }
}
</style>
