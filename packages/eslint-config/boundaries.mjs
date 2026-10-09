import { readFileSync, readdirSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { isBuiltin } from 'node:module'

const inside = (file, directory) => {
  const path = relative(directory, file)
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path))
}
const readPackage = directory => ({
  directory,
  ...JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8')),
})

export function loadWorkspaces(root) {
  const projects = [readPackage(root)]
  for (const group of ['apps', 'packages']) {
    for (const item of readdirSync(resolve(root, group), { withFileTypes: true })) {
      if (item.isDirectory()) projects.push(readPackage(resolve(root, group, item.name)))
    }
  }
  return projects
}

export function workspaceCycles(projects) {
  const byName = new Map(projects.map(project => [project.name, project]))
  const active = []
  const visited = new Set()
  const cycles = []
  function visit(name) {
    const index = active.indexOf(name)
    if (index >= 0) {
      cycles.push([...active.slice(index), name])
      return
    }
    if (visited.has(name)) return
    active.push(name)
    const project = byName.get(name)
    for (const dependency of Object.keys({
      ...project.dependencies,
      ...project.devDependencies,
      ...project.peerDependencies,
    })) {
      if (byName.has(dependency)) visit(dependency)
    }
    active.pop()
    visited.add(name)
  }
  for (const project of projects) visit(project.name)
  return cycles
}

function exported(project, key) {
  if (typeof project.exports === 'string') return key === '.'
  if (!project.exports) return false
  if (!Object.keys(project.exports).some(name => name.startsWith('.'))) return key === '.'
  return Object.keys(project.exports).some(name => {
    if (!name.includes('*')) return name === key
    const [prefix, suffix] = name.split('*')
    return key.startsWith(prefix) && key.endsWith(suffix)
  })
}

const presentationPackages = new Set(['@isport/ui-core', '@isport/ui-admin', '@isport/rich-text'])
const platformPackages = new Set(['@isport/shared', '@isport/design-tokens'])
const framework = /^(vue|nuxt|pinia|antdv-next|@pinia\/nuxt|vue-router)(\/|$)/
const businessRuntime = /^(pinia|vue-router|nuxt|@pinia\/nuxt|ofetch|axios|ky)(\/|$)/

/** Resolve relative workspace paths as well as package specifiers; lexical glob rules cannot do this. */
export function importViolation(projects, filename, specifier) {
  const owner = [...projects]
    .sort((a, b) => b.directory.length - a.directory.length)
    .find(project => inside(filename, project.directory))
  if (!owner) return null
  const app = owner.name === '@isport/portal'
  const isPackage = owner.directory.includes(`${sep}packages${sep}`)
  const source = inside(filename, resolve(owner.directory, 'src'))
  if (isPackage && /^(~\/|@\/|#|apps\/|@isport\/portal(?:\/|$))/.test(specifier))
    return '工作区包不得依赖应用私有实现。'
  if (source && platformPackages.has(owner.name) && framework.test(specifier))
    return '基础包必须保持平台无关。'
  if (
    source &&
    presentationPackages.has(owner.name) &&
    (businessRuntime.test(specifier) || specifier.startsWith('#'))
  )
    return '展示包不得依赖请求、store 或路由运行时。'
  if (specifier.startsWith('.') || isAbsolute(specifier) || (app && /^(~\/|@\/)/.test(specifier))) {
    const targetPath =
      app && /^(~\/|@\/)/.test(specifier)
        ? resolve(owner.directory, 'app', specifier.slice(2))
        : resolve(dirname(filename), specifier)
    const target = [...projects]
      .sort((a, b) => b.directory.length - a.directory.length)
      .find(project => inside(targetPath, project.directory))
    if (target && target.name !== owner.name)
      return '跨 workspace 导入必须使用目标包公开 exports，禁止相对路径绕过边界。'
    return null
  }
  if (specifier.startsWith('#') || isBuiltin(specifier)) return null
  const target = projects.find(
    project => specifier === project.name || specifier.startsWith(`${project.name}/`),
  )
  if (
    target &&
    !exported(target, specifier === target.name ? '.' : `.${specifier.slice(target.name.length)}`)
  )
    return '目标路径未在 package.json 的 exports 中公开。'
  const dependency = specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0]
  if (dependency === owner.name) return null
  const development =
    !source &&
    !inside(filename, resolve(owner.directory, 'app')) &&
    !inside(filename, resolve(owner.directory, 'server'))
  const declared = {
    ...owner.dependencies,
    ...owner.peerDependencies,
    ...(development ? owner.devDependencies : {}),
  }
  if (!Object.hasOwn(declared, dependency))
    return `依赖 ${dependency} 未在当前 workspace 的 package.json 中声明。`
  return null
}

export function boundaryPlugin(root) {
  const projects = loadWorkspaces(root)
  const cycles = workspaceCycles(projects)
  return {
    rules: {
      imports: {
        meta: { type: 'problem', schema: [], messages: { boundary: '{{reason}}' } },
        create(context) {
          const check = node => {
            const specifier =
              node.type === 'TemplateLiteral' && node.expressions.length === 0
                ? node.quasis[0].value.cooked
                : node.value
            if (typeof specifier !== 'string') return
            const reason = importViolation(projects, context.filename, specifier)
            if (reason) context.report({ node, messageId: 'boundary', data: { reason } })
          }
          return {
            ImportDeclaration: node => check(node.source),
            ExportNamedDeclaration: node => {
              if (node.source) check(node.source)
            },
            ExportAllDeclaration: node => check(node.source),
            ImportExpression: node => check(node.source),
            CallExpression: node => {
              if (
                node.callee.type === 'Identifier' &&
                node.callee.name === 'require' &&
                node.arguments[0]
              )
                check(node.arguments[0])
            },
            Program: node => {
              const owner = projects.find(
                project =>
                  project.directory !== root && inside(context.filename, project.directory),
              )
              const cycle = cycles.find(cycle => cycle.includes(owner?.name))
              if (cycle)
                context.report({
                  node,
                  messageId: 'boundary',
                  data: { reason: `workspace 循环依赖：${cycle.join(' → ')}` },
                })
            },
          }
        },
      },
      'presentation-effects': {
        meta: {
          type: 'problem',
          schema: [],
          messages: { effect: '展示包通过 props/emits 或注入回调使用业务能力，禁止直接网络请求。' },
        },
        create(context) {
          const owner = projects.find(
            project =>
              presentationPackages.has(project.name) &&
              inside(context.filename, resolve(project.directory, 'src')),
          )
          if (!owner) return {}
          const forbidden = new Set([
            'fetch',
            '$fetch',
            'XMLHttpRequest',
            'WebSocket',
            'EventSource',
          ])
          return {
            Identifier(node) {
              if (!forbidden.has(node.name)) return
              // Reject global references (including aliases), and explicit globalThis/window properties.
              const reference = context.sourceCode
                .getScope(node)
                .references.find(reference => reference.identifier === node)
              const globalProperty =
                node.parent.type === 'MemberExpression' &&
                node.parent.property === node &&
                ['globalThis', 'window'].includes(node.parent.object.name)
              if (
                (reference && (!reference.resolved || reference.resolved.defs.length === 0)) ||
                globalProperty
              )
                context.report({ node, messageId: 'effect' })
            },
          }
        },
      },
    },
  }
}
