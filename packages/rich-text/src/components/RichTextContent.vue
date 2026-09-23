<script lang="ts">
import { computed, defineComponent, h, useId } from 'vue'
import { parseSafeContent, type SafeContentNode } from '../safe-content'
import type { PropType, VNodeChild } from 'vue'

function renderNode(node: SafeContentNode): VNodeChild {
  return typeof node === 'string' ? node : h(node.tag, node.attrs, node.children.map(renderNode))
}

export default defineComponent({
  name: 'RichTextContent',
  props: {
    content: {
      type: String as PropType<string>,
      default: '',
    },
    showToc: Boolean,
    tocLabel: { type: String, default: '目录' },
  },
  setup(props) {
    const prefix = useId()
    const parsed = computed(() => parseSafeContent(props.content, prefix))
    return () =>
      h('div', { class: 'rich-text-content' }, [
        props.showToc && parsed.value.headings.length
          ? h('nav', { class: 'rich-text-content__toc', 'aria-label': props.tocLabel }, [
              h('strong', props.tocLabel),
              h(
                'ol',
                parsed.value.headings.map(heading =>
                  h('li', { key: heading.id }, h('a', { href: `#${heading.id}` }, heading.text)),
                ),
              ),
            ])
          : null,
        ...parsed.value.nodes.map(renderNode),
      ])
  },
})
</script>

<style>
.rich-text-content {
  color: var(--ic-color-text-primary, #0f172a);
  line-height: var(--ic-line-height-relaxed, 1.75);
}

.rich-text-content img {
  max-width: 100%;
  height: auto;
}

.rich-text-content h2,
.rich-text-content h3 {
  scroll-margin-top: 90px;
}

.rich-text-content__toc {
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 12px;
  background: #eff6ff;
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
