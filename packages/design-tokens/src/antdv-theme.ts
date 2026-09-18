/**
 * 将设计令牌映射为 antdv-next ConfigProvider 主题 Token。
 * antdv-next 不单独维护品牌色与圆角，统一消费本文件。
 */
import {
  borderRadius,
  colorBackground,
  colorBrand,
  colorSemantic,
  colorText,
  fontFamily,
} from './tokens'

export const antdvThemeToken = {
  colorPrimary: colorBrand[500],
  colorSuccess: colorSemantic.success,
  colorWarning: colorSemantic.warning,
  colorError: colorSemantic.error,
  colorInfo: colorSemantic.info,
  colorTextBase: colorText.primary,
  colorBgLayout: colorBackground.page,
  borderRadius: Number.parseInt(borderRadius.md, 10),
  fontFamily: fontFamily.sans,
} as const

export type AntdvThemeToken = typeof antdvThemeToken
