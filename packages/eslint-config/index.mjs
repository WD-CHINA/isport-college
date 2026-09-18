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
 * @param {{ vue?: boolean }} [options] vue 为 true 时启用 Vue SFC 规则（apps/portal 使用）
 */
export function defineConfig(options = {}) {
  const { vue = false } = options

  /** @type {import('eslint').Linter.Config[]} */
  const configs = [
    globalIgnores,
    js.configs.recommended,
    ...ts.configs.recommended,
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.es2022,
        },
      },
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        // TS/Vue 文件由类型系统负责未定义变量检查（含 Nuxt 自动导入全局），no-undef 对 TS 不可靠
        'no-undef': 'off',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
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
