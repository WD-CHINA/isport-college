import { describe, expect, it } from 'vitest'
import { DEFAULT_DOCUMENT_PREVIEW_BASE, toDocumentPreviewUrl } from '../app/utils/document-preview'

describe('toDocumentPreviewUrl', () => {
  it('拼接预览服务参数并对文件地址编码', () => {
    const fileUrl = 'https://cdn.example.com/a b.pdf'
    const url = toDocumentPreviewUrl(fileUrl, DEFAULT_DOCUMENT_PREVIEW_BASE)
    expect(url.startsWith('http://8.133.231.181:11001/?')).toBe(true)
    expect(url).toContain('showHeader=0')
    expect(url).toContain('showImport=0')
    expect(url).toContain('showUrlImport=0')
    expect(url).toContain('showToolbar=1')
    expect(url).toContain(`url=${encodeURIComponent(fileUrl)}`)
  })

  it('预览根地址无查询串时使用 ?url', () => {
    expect(toDocumentPreviewUrl('https://cdn.example.com/a.pdf', 'http://viewer.local')).toBe(
      'http://viewer.local?url=https%3A%2F%2Fcdn.example.com%2Fa.pdf',
    )
  })
})
