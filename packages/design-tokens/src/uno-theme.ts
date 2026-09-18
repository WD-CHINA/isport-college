/**
 * 将设计令牌映射为 UnoCSS theme。
 * UnoCSS 不单独维护品牌色与间距，统一消费本文件。
 * 命名约定：bg-surface-page / text-content / text-content-secondary /
 * border-line / bg-primary / bg-brand-600 / text-success 等。
 */
import {
  borderRadius,
  boxShadow,
  breakpoints,
  colorAccent,
  colorBackground,
  colorBorder,
  colorBrand,
  colorCategory,
  colorSemantic,
  colorText,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  motion,
  spacing,
  zIndex,
} from './tokens'

export const unoTheme = {
  colors: {
    brand: colorBrand,
    primary: colorBrand[500],
    accent: colorAccent,
    ...colorSemantic,
    category: colorCategory,
    content: {
      DEFAULT: colorText.primary,
      secondary: colorText.secondary,
      tertiary: colorText.tertiary,
      inverse: colorText.inverse,
    },
    surface: {
      page: colorBackground.page,
      container: colorBackground.container,
      elevated: colorBackground.elevated,
    },
    line: {
      DEFAULT: colorBorder.base,
      strong: colorBorder.strong,
    },
  },
  fontFamily: {
    sans: fontFamily.sans,
    mono: fontFamily.mono,
  },
  fontSize: {
    xs: [fontSize.xs, lineHeight.normal],
    sm: [fontSize.sm, lineHeight.normal],
    base: [fontSize.base, lineHeight.normal],
    lg: [fontSize.lg, lineHeight.normal],
    xl: [fontSize.xl, lineHeight.tight],
    '2xl': [fontSize['2xl'], lineHeight.tight],
    '3xl': [fontSize['3xl'], lineHeight.tight],
    '4xl': [fontSize['4xl'], lineHeight.tight],
  },
  fontWeight,
  lineHeight,
  spacing,
  breakpoints,
  borderRadius,
  boxShadow,
  zIndex,
  duration: motion.duration,
  easing: motion.easing,
} as const

export type UnoTheme = typeof unoTheme
