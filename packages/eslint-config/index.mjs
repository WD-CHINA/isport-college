import js from '@eslint/js'
import vuePlugin from 'eslint-plugin-vue'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'
import ts from 'typescript-eslint'

const globalIgnores = {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/playwright-report/**',
    '**/test-results/**',
    '**/css-vars.css',
    '**/tokens.json',
  ],
}

/**
 * 创建项目 ESLint flat config。
 * @param {{ vue?: boolean, tsconfigRootDir?: string }} [options]
 * vue 为 true 时为整个工作区启用 Vue SFC 规则。
 * tsconfigRootDir 由仓库根 eslint.config.mjs 显式传入，避免编辑器推断歧义。
 */
export function defineConfig(options = {}) {
  const { vue = false, tsconfigRootDir } = options

  /** @type {import('eslint').Linter.Config[]} */
  const configs = [
    globalIgnores,
    js.configs.recommended,
    ...ts.configs.recommended,
    {
      languageOptions: {
        globals: {
          ...globals.es2022,
        },
        ...(tsconfigRootDir ? { parserOptions: { tsconfigRootDir } } : {}),
      },
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      },
    },
    {
      files: ['**/*.{ts,tsx,vue}'],
      rules: {
        // TS/Vue 文件由类型系统负责未定义变量检查，no-undef 对 TypeScript 不可靠
        'no-undef': 'off',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: [
        'apps/portal/app/**/*.{js,ts,vue}',
        'packages/ui-core/src/**/*.{js,ts,vue}',
        'packages/ui-admin/src/**/*.{js,ts,vue}',
      ],
      languageOptions: {
        globals: globals.browser,
      },
    },
    {
      files: [
        '*.{js,mjs,cjs,ts}',
        '**/*.config.{js,mjs,cjs,ts}',
        'scripts/**/*.{js,mjs,cjs,ts}',
        'packages/*/scripts/**/*.{js,mjs,cjs,ts}',
        'apps/portal/server/**/*.ts',
      ],
      languageOptions: {
        globals: globals.node,
      },
    },
    {
      files: ['packages/shared/src/**/*.ts'],
      rules: {
        'no-restricted-globals': [
          'error',
          { name: 'window', message: 'shared 必须保持平台无关，禁止使用浏览器全局。' },
          { name: 'document', message: 'shared 必须保持平台无关，禁止使用浏览器全局。' },
          { name: 'navigator', message: 'shared 必须保持平台无关，禁止使用浏览器全局。' },
          { name: 'localStorage', message: 'shared 必须保持平台无关，禁止使用浏览器存储。' },
          { name: 'sessionStorage', message: 'shared 必须保持平台无关，禁止使用浏览器存储。' },
        ],
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: ['vue', 'vue/*'], message: 'shared 不得依赖 Vue。' },
              { group: ['nuxt', 'nuxt/*'], message: 'shared 不得依赖 Nuxt。' },
              { group: ['pinia', '@pinia/*'], message: 'shared 不得依赖 Pinia。' },
            ],
          },
        ],
      },
    },
  ]

  if (vue) {
    configs.push(...vuePlugin.configs['flat/recommended'], {
      files: ['**/*.vue'],
      languageOptions: {
        parserOptions: {
          parser: ts.parser,
        },
      },
      rules: {
        // Nuxt 页面（index.vue 等）不强制多词组件名
        'vue/multi-word-component-names': 'off',
        // SFC 顺序统一为 <script>、<template>、<style>
        'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
        'vue/component-api-style': ['error', ['script-setup', 'composition']],
        'vue/define-macros-order': 'error',
        // 不可信内容不得直接通过 v-html 渲染
        'vue/no-v-html': 'error',
        // 纯排版规则交给开发者与编辑器，避免与紧凑模板风格冲突
        'vue/max-attributes-per-line': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        // 与 Prettier 冲突（void 元素自闭合风格由 Prettier 统一）
        'vue/html-self-closing': 'off',
      },
    })
  }

  // 格式化统一交给 Prettier：关闭与其冲突的 ESLint 格式规则（必须置于最后）
  configs.push(eslintConfigPrettier)

  return configs
}

export default defineConfig
