/**
 * 提交前增量处理：先 Prettier 统一格式，再由 ESLint/Stylelint 修复质量问题。
 * 各子包文件会自动命中其就近的 eslint.config.mjs。
 */
export default {
  '*.{js,mjs,cjs,ts,tsx,vue,json,jsonc,md,yml,yaml}': ['prettier --write'],
  '*.{js,mjs,cjs,ts,tsx,vue}': ['eslint --fix --max-warnings=0'],
  '*.{css,scss,vue}': ['stylelint --fix'],
}
