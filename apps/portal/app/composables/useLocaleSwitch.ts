/** 语言切换：v-model 绑定当前语言，切换时跳转至对应语言路由 */
export function useLocaleSwitch() {
  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const localeOptions = computed(() =>
    locales.value.map(item => ({
      value: item.code,
      label: item.name ?? item.code,
    })),
  )

  const localeModel = computed({
    get: () => locale.value,
    set: (code: string) => {
      void navigateTo(switchLocalePath(code as typeof locale.value))
    },
  })

  return { localeModel, localeOptions }
}
