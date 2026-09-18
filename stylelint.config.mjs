/**
 * Stylelint：CSS/SCSS/Vue SFC 样式检查。
 * 格式问题交给 Prettier（stylelint v16 已移除格式规则，无冲突）。
 */
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
  rules: {
    // 项目使用 @media (min-width: ...) 传统写法，兼容性与可读性更好
    'media-feature-range-notation': null,
    // 允许 BEM（block__element--modifier）与 kebab-case 类名
    'selector-class-pattern': null,
    // CSS 变量统一 --ic-* 前缀（设计令牌），组件局部变量不在此限
    'custom-property-pattern': null,
    // 生成的令牌文件与第三方产物不检查
  },
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/.turbo/**',
    '**/css-vars.css',
    '**/tokens.json',
    '**/playwright-report/**',
    '**/test-results/**',
  ],
}
