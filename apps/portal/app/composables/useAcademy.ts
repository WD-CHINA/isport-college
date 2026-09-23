import type { DataSource, ProductPhase } from '@isport/shared'

export function useAcademy() {
  return useNuxtApp().$academy
}

export function useAcademySettings() {
  return useState<{ dataSource: DataSource; productPhase: ProductPhase } | null>(
    'academy-settings',
    () => null,
  )
}
