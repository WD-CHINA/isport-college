import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

export function createRichTextExtensions(placeholder = '') {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    Placeholder.configure({ placeholder }),
  ]
}
