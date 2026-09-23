import { ElementType, parseDocument } from 'htmlparser2'
import { isLocalImageUrl, safeRichTextHref } from '@isport/shared'

type ParsedNode = ReturnType<typeof parseDocument>['children'][number]
export type SafeContentNode =
  string | { tag: string; attrs: Record<string, string>; children: SafeContentNode[] }
export interface ContentHeading {
  id: string
  text: string
  level: number
}
const allowed = new Set([
  'blockquote',
  'br',
  'code',
  'em',
  'h2',
  'h3',
  'hr',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'strong',
  'ul',
  'a',
  'img',
])
const dropped = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'svg',
  'math',
  'template',
  'form',
  'input',
  'button',
])
function plain(nodes: SafeContentNode[]): string {
  return nodes.map(node => (typeof node === 'string' ? node : plain(node.children))).join('')
}

/** SSR 与浏览器共用解析器，所有用户属性默认丢弃，目录来自相同安全节点树。 */
export function parseSafeContent(content: string, anchorPrefix = 'article') {
  const headings: ContentHeading[] = []
  const prefix = anchorPrefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'article'
  function walk(nodes: ParsedNode[], depth = 0): SafeContentNode[] {
    if (depth > 50) return []
    return nodes.flatMap((node): SafeContentNode[] => {
      if (node.type === ElementType.Text) return [node.data]
      if (node.type !== ElementType.Tag || dropped.has(node.name)) return []
      const attrs: Record<string, string> = {}
      const isHeading = node.name === 'h2' || node.name === 'h3'
      const heading = isHeading
        ? {
            id: `${prefix}-section-${headings.length + 1}`,
            text: '',
            level: Number(node.name.slice(1)),
          }
        : undefined
      if (heading) headings.push(heading)
      const children = walk(node.children, depth + 1)
      if (!allowed.has(node.name)) return children
      if (node.name === 'a') {
        const href = safeRichTextHref(node.attribs.href ?? '')
        if (!href) return children
        attrs.href = href
        attrs.rel = 'noopener noreferrer'
        if (href.startsWith('https://')) attrs.target = '_blank'
      }
      if (node.name === 'img') {
        const src = node.attribs.src ?? ''
        if (!isLocalImageUrl(src)) return []
        attrs.src = src
        attrs.alt = (node.attribs.alt ?? '').slice(0, 200)
        attrs.loading = 'lazy'
      }
      if (heading) {
        heading.text = plain(children).trim()
        attrs.id = heading.id
      }
      return [{ tag: node.name, attrs, children }]
    })
  }
  const nodes = walk(parseDocument(content.slice(0, 100000)).children)
  return { nodes, headings }
}
