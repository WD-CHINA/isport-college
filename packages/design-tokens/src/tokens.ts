/**
 * 设计令牌单一来源。
 * 所有样式值（颜色 / 字号 / 间距 / 圆角 / 阴影 / 层级 / 断点 / 动效）在此定义，
 * 并由 scripts/generate.mjs 派生 css-vars.css 与 tokens.json，
 * 由 uno-theme.ts / antdv-theme.ts 分别映射给 UnoCSS 与 antdv-next。
 */

/** 品牌色阶梯 */
export const colorBrand = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#2563eb',
  600: '#1d4ed8',
  700: '#1e40af',
  800: '#1e3a8a',
  900: '#172554',
} as const

/** 强调色（运动活力橙） */
export const colorAccent = '#f97316'

/** 语义色 */
export const colorSemantic = {
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0891b2',
} as const

/** 文本色 */
export const colorText = {
  primary: '#0f172a',
  secondary: '#475569',
  tertiary: '#94a3b8',
  inverse: '#ffffff',
} as const

/** 背景色 */
export const colorBackground = {
  page: '#f8fafc',
  container: '#ffffff',
  elevated: '#ffffff',
} as const

/** 课程分类色（封面渐变等装饰用途） */
export const colorCategory = {
  fitness: '#2563eb',
  ball: '#f97316',
  swim: '#0891b2',
  dance: '#db2777',
  outdoor: '#16a34a',
} as const

/** 边框色 */
export const colorBorder = {
  base: '#e2e8f0',
  strong: '#cbd5e1',
} as const

/** 字体族 */
export const fontFamily = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
} as const

/** 字号（px） */
export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
} as const

/** 字重 */
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

/** 行高 */
export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const

/** 间距阶梯（px） */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

/** 圆角 */
export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

/** 阴影 */
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
  md: '0 4px 12px -2px rgb(15 23 42 / 0.10)',
  lg: '0 12px 32px -8px rgb(15 23 42 / 0.16)',
} as const

/** Z-Index 层级 */
export const zIndex = {
  base: 0,
  sticky: 100,
  dropdown: 200,
  overlay: 500,
  modal: 1000,
  toast: 1100,
} as const

/** 响应式断点（min-width） */
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/** 动效时长与缓动 */
export const motion = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const

export const tokens = {
  colorBrand,
  colorAccent,
  colorSemantic,
  colorCategory,
  colorText,
  colorBackground,
  colorBorder,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  borderRadius,
  boxShadow,
  zIndex,
  breakpoints,
  motion,
} as const

export type Tokens = typeof tokens
