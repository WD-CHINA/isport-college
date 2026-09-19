<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { computed, watch } from 'vue'

import { createRichTextExtensions } from '../editor'

export interface RichTextEditorLabels {
  bold: string
  italic: string
  strike: string
  heading2: string
  heading3: string
  bulletList: string
  orderedList: string
  blockquote: string
  codeBlock: string
  undo: string
  redo: string
}

interface Props {
  disabled?: boolean
  labels?: Partial<RichTextEditorLabels>
  minHeight?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  labels: () => ({}),
  minHeight: '160px',
  placeholder: '',
})

const model = defineModel<string>({ default: '' })

const defaultLabels: RichTextEditorLabels = {
  bold: '加粗',
  italic: '斜体',
  strike: '删除线',
  heading2: '二级标题',
  heading3: '三级标题',
  bulletList: '无序列表',
  orderedList: '有序列表',
  blockquote: '引用',
  codeBlock: '代码块',
  undo: '撤销',
  redo: '重做',
}

const toolbarLabels = computed(() => ({ ...defaultLabels, ...props.labels }))

const editor = useEditor({
  content: model.value,
  editable: !props.disabled,
  extensions: createRichTextExtensions(props.placeholder),
  editorProps: {
    attributes: {
      'aria-label': props.placeholder || '富文本编辑器',
      class: 'rich-text-editor__content',
    },
  },
  onUpdate: ({ editor: currentEditor }) => {
    model.value = currentEditor.isEmpty ? '' : currentEditor.getHTML()
  },
})

watch(model, value => {
  if (!editor.value || editor.value.getHTML() === value) return
  editor.value.commands.setContent(value, { emitUpdate: false })
})

watch(
  () => props.disabled,
  disabled => editor.value?.setEditable(!disabled),
)
</script>

<template>
  <div
    class="rich-text-editor"
    :class="{ 'rich-text-editor--disabled': disabled }"
    :style="{ '--rich-text-min-height': minHeight }"
  >
    <div v-if="editor" class="rich-text-editor__toolbar" role="toolbar">
      <button
        type="button"
        class="rich-text-editor__button rich-text-editor__button--bold"
        :class="{ 'is-active': editor.isActive('bold') }"
        :aria-label="toolbarLabels.bold"
        :title="toolbarLabels.bold"
        :aria-pressed="editor.isActive('bold')"
        :disabled="disabled || !editor.can().chain().focus().toggleBold().run()"
        @mousedown.prevent
        @click="editor.chain().focus().toggleBold().run()"
      >
        B
      </button>
      <button
        type="button"
        class="rich-text-editor__button rich-text-editor__button--italic"
        :class="{ 'is-active': editor.isActive('italic') }"
        :aria-label="toolbarLabels.italic"
        :title="toolbarLabels.italic"
        :aria-pressed="editor.isActive('italic')"
        :disabled="disabled || !editor.can().chain().focus().toggleItalic().run()"
        @mousedown.prevent
        @click="editor.chain().focus().toggleItalic().run()"
      >
        I
      </button>
      <button
        type="button"
        class="rich-text-editor__button rich-text-editor__button--strike"
        :class="{ 'is-active': editor.isActive('strike') }"
        :aria-label="toolbarLabels.strike"
        :title="toolbarLabels.strike"
        :aria-pressed="editor.isActive('strike')"
        :disabled="disabled || !editor.can().chain().focus().toggleStrike().run()"
        @mousedown.prevent
        @click="editor.chain().focus().toggleStrike().run()"
      >
        S
      </button>
      <span class="rich-text-editor__divider" aria-hidden="true" />
      <button
        v-for="level in [2, 3] as const"
        :key="level"
        type="button"
        class="rich-text-editor__button"
        :class="{ 'is-active': editor.isActive('heading', { level }) }"
        :aria-label="level === 2 ? toolbarLabels.heading2 : toolbarLabels.heading3"
        :title="level === 2 ? toolbarLabels.heading2 : toolbarLabels.heading3"
        :aria-pressed="editor.isActive('heading', { level })"
        :disabled="disabled"
        @mousedown.prevent
        @click="editor.chain().focus().toggleHeading({ level }).run()"
      >
        H{{ level }}
      </button>
      <span class="rich-text-editor__divider" aria-hidden="true" />
      <button
        type="button"
        class="rich-text-editor__button"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        :aria-label="toolbarLabels.bulletList"
        :title="toolbarLabels.bulletList"
        :aria-pressed="editor.isActive('bulletList')"
        :disabled="disabled"
        @mousedown.prevent
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • List
      </button>
      <button
        type="button"
        class="rich-text-editor__button"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        :aria-label="toolbarLabels.orderedList"
        :title="toolbarLabels.orderedList"
        :aria-pressed="editor.isActive('orderedList')"
        :disabled="disabled"
        @mousedown.prevent
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. List
      </button>
      <button
        type="button"
        class="rich-text-editor__button"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        :aria-label="toolbarLabels.blockquote"
        :title="toolbarLabels.blockquote"
        :aria-pressed="editor.isActive('blockquote')"
        :disabled="disabled"
        @mousedown.prevent
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        “ ”
      </button>
      <button
        type="button"
        class="rich-text-editor__button"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        :aria-label="toolbarLabels.codeBlock"
        :title="toolbarLabels.codeBlock"
        :aria-pressed="editor.isActive('codeBlock')"
        :disabled="disabled"
        @mousedown.prevent
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        &lt;/&gt;
      </button>
      <span class="rich-text-editor__divider" aria-hidden="true" />
      <button
        type="button"
        class="rich-text-editor__button"
        :aria-label="toolbarLabels.undo"
        :title="toolbarLabels.undo"
        :disabled="disabled || !editor.can().chain().focus().undo().run()"
        @mousedown.prevent
        @click="editor.chain().focus().undo().run()"
      >
        ↶
      </button>
      <button
        type="button"
        class="rich-text-editor__button"
        :aria-label="toolbarLabels.redo"
        :title="toolbarLabels.redo"
        :disabled="disabled || !editor.can().chain().focus().redo().run()"
        @mousedown.prevent
        @click="editor.chain().focus().redo().run()"
      >
        ↷
      </button>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.rich-text-editor {
  overflow: hidden;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-md, 8px);
  background: var(--ic-color-background-container, #fff);
  transition: border-color var(--ic-motion-duration-fast, 150ms);
}

.rich-text-editor:focus-within {
  border-color: var(--ic-color-brand-500, #2563eb);
  box-shadow: 0 0 0 2px rgb(37 99 235 / 10%);
}

.rich-text-editor--disabled {
  cursor: not-allowed;
  background: var(--ic-color-background-page, #f8fafc);
  opacity: 0.65;
}

.rich-text-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ic-spacing-1, 4px);
  align-items: center;
  padding: var(--ic-spacing-2, 8px);
  border-bottom: 1px solid var(--ic-color-border-base, #e2e8f0);
}

.rich-text-editor__button {
  min-width: 32px;
  height: 32px;
  padding: 0 var(--ic-spacing-2, 8px);
  border: 0;
  border-radius: var(--ic-border-radius-sm, 4px);
  background: transparent;
  color: var(--ic-color-text-secondary, #475569);
  font: inherit;
  font-size: var(--ic-font-size-sm, 14px);
  cursor: pointer;
}

.rich-text-editor__button:hover:not(:disabled),
.rich-text-editor__button.is-active {
  background: var(--ic-color-brand-50, #eff6ff);
  color: var(--ic-color-brand-600, #1d4ed8);
}

.rich-text-editor__button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.rich-text-editor__button--bold {
  font-weight: var(--ic-font-weight-bold, 700);
}

.rich-text-editor__button--italic {
  font-style: italic;
}

.rich-text-editor__button--strike {
  text-decoration: line-through;
}

.rich-text-editor__divider {
  width: 1px;
  height: 20px;
  margin: 0 var(--ic-spacing-1, 4px);
  background: var(--ic-color-border-base, #e2e8f0);
}

.rich-text-editor__content {
  min-height: var(--rich-text-min-height);
  padding: var(--ic-spacing-3, 12px);
  color: var(--ic-color-text-primary, #0f172a);
  line-height: var(--ic-line-height-relaxed, 1.75);
  outline: none;
}

.rich-text-editor__content > :first-child {
  margin-top: 0;
}

.rich-text-editor__content > :last-child {
  margin-bottom: 0;
}

.rich-text-editor__content p.is-editor-empty:first-child::before {
  float: left;
  height: 0;
  color: var(--ic-color-text-tertiary, #94a3b8);
  pointer-events: none;
  content: attr(data-placeholder);
}

.rich-text-editor__content blockquote {
  margin-left: 0;
  padding-left: var(--ic-spacing-4, 16px);
  border-left: 3px solid var(--ic-color-brand-300, #93c5fd);
  color: var(--ic-color-text-secondary, #475569);
}

.rich-text-editor__content pre {
  overflow-x: auto;
  padding: var(--ic-spacing-3, 12px);
  border-radius: var(--ic-border-radius-sm, 4px);
  background: var(--ic-color-text-primary, #0f172a);
  color: var(--ic-color-text-inverse, #fff);
  font-family: var(--ic-font-family-mono, monospace);
}
</style>
