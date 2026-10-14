import { defineConfig } from '@isport/eslint-config'
import { boundaryPlugin } from '@isport/eslint-config/boundaries'

const runtimePackages = [
  '@isport/design-tokens',
  '@isport/i18n',
  '@isport/rich-text',
  '@isport/shared',
  '@isport/ui-admin',
  '@isport/ui-core',
  '@isport/unocss-preset',
]

const appPrivateImports = {
  group: ['~/**', '@/**', '#*', 'apps/**', '@isport/portal', '@isport/portal/**'],
  message: '工作区包不得依赖 Portal 的私有实现。请通过包的公开 exports 共享能力。',
}

const packagePrivateImports = {
  group: ['@isport/*/src', '@isport/*/src/**'],
  message: '禁止跨包读取 src 私有文件；请使用目标包 package.json 中声明的 exports。',
}

function packageBoundary(files, packageName, allowedPackages = [], extraPatterns = []) {
  const forbiddenPackages = runtimePackages
    .filter(name => name !== packageName && !allowedPackages.includes(name))
    .flatMap(name => [name, `${name}/**`])

  return {
    files,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            appPrivateImports,
            packagePrivateImports,
            {
              group: forbiddenPackages,
              message: `${packageName} 的依赖方向不符合 Monorepo 分层。`,
            },
            ...extraPatterns,
          ],
        },
      ],
    },
  }
}

/**
 * 工作区唯一 ESLint 配置。
 * 所有应用与包向上查找并复用该配置，避免多份配置漂移与 TSConfig 根目录歧义。
 */
export default [
  ...defineConfig({ vue: true, tsconfigRootDir: import.meta.dirname }),
  {
    files: ['apps/**/*.{js,mjs,ts,tsx,vue}', 'packages/**/*.{js,mjs,ts,tsx,vue}'],
    plugins: { architecture: boundaryPlugin(import.meta.dirname) },
    rules: { 'architecture/imports': 'error', 'architecture/presentation-effects': 'error' },
  },
  packageBoundary(
    ['packages/shared/src/**/*.ts', 'packages/shared/test/**/*.ts'],
    '@isport/shared',
    [],
    [
      {
        group: [
          'vue',
          'vue/**',
          'nuxt',
          'nuxt/**',
          'pinia',
          '@pinia/**',
          'antdv-next',
          'antdv-next/**',
        ],
        message: 'shared 必须保持平台无关，不得依赖 Vue、Nuxt、Pinia 或 UI 框架。',
      },
    ],
  ),
  packageBoundary(
    ['packages/design-tokens/src/**/*.ts'],
    '@isport/design-tokens',
    [],
    [
      {
        group: [
          'vue',
          'vue/**',
          'nuxt',
          'nuxt/**',
          'pinia',
          '@pinia/**',
          'antdv-next',
          'antdv-next/**',
        ],
        message: 'design-tokens 只输出平台无关的令牌与主题对象。',
      },
    ],
  ),
  packageBoundary(['packages/i18n/src/**/*.ts'], '@isport/i18n', ['@isport/shared']),
  packageBoundary(['packages/unocss-preset/src/**/*.ts'], '@isport/unocss-preset', [
    '@isport/design-tokens',
  ]),
  packageBoundary(['packages/ui-core/src/**/*.{ts,tsx,vue}'], '@isport/ui-core', [
    '@isport/shared',
    '@isport/design-tokens',
  ]),
  packageBoundary(['packages/ui-admin/src/**/*.{ts,tsx,vue}'], '@isport/ui-admin', [
    '@isport/shared',
    '@isport/design-tokens',
    '@isport/ui-core',
  ]),
  packageBoundary(
    ['packages/rich-text/src/**/*.{ts,tsx,vue}', 'packages/rich-text/test/**/*.ts'],
    '@isport/rich-text',
    ['@isport/shared', '@isport/design-tokens', '@isport/ui-core'],
  ),
  {
    files: ['apps/portal/app/**/*.{ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [packagePrivateImports],
        },
      ],
    },
  },
  {
    files: ['apps/portal/**/*.vue'],
    rules: {
      'vue/block-lang': ['error', { style: { lang: 'scss' } }],
    },
  },
]
