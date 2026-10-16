import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { Linter } from 'eslint'
import { boundaryPlugin, importViolation, loadWorkspaces, workspaceCycles } from '../boundaries.mjs'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const projects = loadWorkspaces(root)
const file = path => resolve(root, path)

test('workspace discovery ignores removed packages with only generated directories', () => {
  const fixture = mkdtempSync(resolve(tmpdir(), 'isport-boundaries-'))
  try {
    mkdirSync(resolve(fixture, 'apps'))
    mkdirSync(resolve(fixture, 'packages', 'removed', 'node_modules'), { recursive: true })
    mkdirSync(resolve(fixture, 'packages', 'current'))
    writeFileSync(resolve(fixture, 'package.json'), JSON.stringify({ name: 'root' }))
    writeFileSync(
      resolve(fixture, 'packages', 'current', 'package.json'),
      JSON.stringify({ name: 'current' }),
    )
    assert.deepEqual(
      loadWorkspaces(fixture).map(project => project.name),
      ['root', 'current'],
    )
  } finally {
    assert.ok(fixture.startsWith(resolve(tmpdir(), 'isport-boundaries-')))
    rmSync(fixture, { recursive: true, force: true })
  }
})

test('relative imports cannot bypass app or package boundaries', () => {
  assert.match(
    importViolation(
      projects,
      file('packages/ui-core/src/a.ts'),
      '../../../apps/portal/app/stores/auth',
    ),
    /workspace/,
  )
  assert.match(
    importViolation(projects, file('apps/portal/app/a.ts'), '../../../packages/shared/src/web-api'),
    /workspace/,
  )
  assert.match(importViolation(projects, file('packages/shared/src/a.ts'), '~/stores/auth'), /私有/)
})
test('public exports and dependency declarations are enforced', () => {
  assert.equal(importViolation(projects, file('apps/portal/app/a.ts'), '@isport/shared'), null)
  assert.equal(
    importViolation(projects, file('apps/portal/app/a.ts'), '@isport/design-tokens/antdv-theme'),
    null,
  )
  assert.match(
    importViolation(projects, file('apps/portal/app/a.ts'), '@isport/shared/src/web-api'),
    /exports/,
  )
  assert.match(
    importViolation(projects, file('packages/ui-core/src/a.ts'), 'undeclared-sdk'),
    /声明/,
  )
  assert.match(importViolation(projects, file('packages/ui-core/src/a.ts'), 'pinia'), /展示包/)
})
test('runtime and development workspace cycles are detected', () => {
  assert.deepEqual(
    workspaceCycles([
      { name: 'a', dependencies: { b: '*' } },
      { name: 'b', devDependencies: { a: '*' } },
    ]),
    [['a', 'b', 'a']],
  )
  assert.deepEqual(workspaceCycles(projects), [])
})
test('ESLint catches static, dynamic and re-export bypasses', () => {
  const linter = new Linter({ cwd: root })
  const config = [
    {
      languageOptions: {
        globals: { fetch: 'readonly', window: 'readonly', XMLHttpRequest: 'readonly' },
      },
      plugins: { architecture: boundaryPlugin(root) },
      rules: { 'architecture/imports': 'error', 'architecture/presentation-effects': 'error' },
    },
  ]
  for (const code of [
    "import x from '../../../apps/portal/app/stores/auth'",
    "export * from '../../../apps/portal/app/stores/auth'",
    "import('../../../apps/portal/app/stores/auth')",
    'import(`../../../apps/portal/app/stores/auth`)',
    "const network = fetch; network('/api')",
    "window.fetch('/api')",
    'new XMLHttpRequest()',
  ])
    assert.ok(
      linter
        .verify(code, config, { filename: file('packages/ui-core/src/probe.js') })
        .some(message => message.ruleId?.startsWith('architecture/')),
      code,
    )
  assert.equal(
    linter.verify("import { computed } from 'vue'", config, {
      filename: file('packages/ui-core/src/probe.js'),
    }).length,
    0,
  )
})
