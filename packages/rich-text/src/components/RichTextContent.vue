<script lang="ts">
import { ElementType, parseDocument } from 'htmlparser2'
import { computed, defineComponent, h } from 'vue'
import type { PropType, VNodeChild } from 'vue'

type RichTextNode = ReturnType<typeof parseDocument>['children'][number]

const allowedTags = new Set([
  'a',
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
])

function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined
  return /^(https?:|mailto:|\/|#)/i.test(href.trim()) ? href : undefined
}

function renderChildren(children: RichTextNode[]): VNodeChild[] {
  return children.map(renderNode).filter((node): node is Exclude<VNodeChild, null> => node !== null)
}

function renderNode(node: RichTextNode): VNodeChild | null {
  if (node.type === ElementType.Text) return node.data
  if (node.type === ElementType.Script || node.type === ElementType.Style) return null
  if (node.type !== ElementType.Tag) return null

  const children = renderChildren(node.children)
  if (!allowedTags.has(node.name)) return children

  if (node.name === 'a') {
    const href = safeHref(node.attribs.href)
    return href ? h('a', { href, rel: 'noopener noreferrer' }, children) : children
  }

  return h(node.name, null, children)
}

export default defineComponent({
  name: 'RichTextContent',
  props: {
    content: {
      type: String as PropType<string>,
      default: '',
    },
  },
  setup(props) {
    const nodes = computed(() => renderChildren(parseDocument(props.content).children))
    return () => h('div', { class: 'rich-text-content' }, nodes.value)
  },
})
</script>

<style>
.rich-text-content {
  color: var(--ic-color-text-primary, #0f172a);
  line-height: var(--ic-line-height-relaxed, 1.75);
}

.rich-text-content > :first-child {
  margin-top: 0;
}

.rich-text-content > :last-child {
  margin-bottom: 0;
}

.rich-text-content blockquote {
  margin-left: 0;
  padding-left: var(--ic-spacing-4, 16px);
  border-left: 3px solid var(--ic-color-brand-300, #93c5fd);
  color: var(--ic-color-text-secondary, #475569);
}

.rich-text-content pre {
  overflow-x: auto;
  padding: var(--ic-spacing-3, 12px);
  border-radius: var(--ic-border-radius-sm, 4px);
  background: var(--ic-color-text-primary, #0f172a);
  color: var(--ic-color-text-inverse, #fff);
  font-family: var(--ic-font-family-mono, monospace);
}
</style>
