import { isLocalImageUrl, safeRichTextHref } from '@isport/shared'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

export function createRichTextExtensions(placeholder = '') {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: {
        openOnClick: false,
        autolink: false,
        isAllowedUri: url => Boolean(safeRichTextHref(url)),
      },
    }),
    Image.extend({
      parseHTML() {
        return [
          {
            tag: 'img[src]',
            getAttrs: element =>
              isLocalImageUrl(element.getAttribute('src') ?? '') ? null : false,
          },
        ]
      },
    }).configure({ allowBase64: false }),
    Placeholder.configure({ placeholder }),
  ]
}
