/**
 * 项目级 UnoCSS Preset：
 * - 基于 presetWind3，主题值全部来自 @isport/design-tokens（单一来源）。
 * - shortcuts 仅沉淀项目级通用模式，不承载业务组件样式。
 */
import type { Preset } from 'unocss'
import { unoTheme } from '@isport/design-tokens/uno-theme'
import { presetWind3 } from 'unocss'

/** 触控目标最小 44px（移动端可达性原则） */
const TOUCH_MIN = 'min-h-11 min-w-11'

export function presetIsport(): Preset[] {
  return [
    presetWind3(),
    {
      name: '@isport/unocss-preset',
      theme: unoTheme,
      shortcuts: {
        'container-page': 'mx-auto w-full max-w-screen-xl px-4 md:px-6',
        btn: `inline-flex items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-fast cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${TOUCH_MIN}`,
        'btn-primary': 'btn bg-primary text-content-inverse hover:bg-brand-600 active:bg-brand-700',
        'btn-ghost': 'btn bg-transparent text-content hover:bg-surface-page',
        'btn-outline':
          'btn border border-line bg-surface-container text-content hover:border-primary hover:text-primary',
        card: 'bg-surface-container rounded-lg border border-line shadow-sm',
        link: 'text-primary transition-colors duration-fast hover:text-brand-600',
        input: `w-full rounded-md border border-line bg-surface-container px-3 text-sm text-content outline-none transition-colors duration-fast focus:border-primary placeholder:text-content-tertiary ${TOUCH_MIN}`,
      },
      rules: [
        ['safe-b', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
        ['safe-t', { 'padding-top': 'env(safe-area-inset-top)' }],
      ],
    },
  ]
}

export default presetIsport
