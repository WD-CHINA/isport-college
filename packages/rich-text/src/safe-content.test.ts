import { describe, expect, it } from 'vitest'
import { isLocalImageUrl, safeRichTextHref } from '@isport/shared'
import { parseSafeContent } from './safe-content'

describe('富文本白名单和目录', () => {
  it('移除脚本、事件属性、主动嵌入、外部图片与危险协议', () => {
    const parsed = parseSafeContent(
      '<script>alert(1)</script><style>body{display:none}</style><iframe src="https://example.org"><h2>隐藏</h2></iframe><svg onload="alert(1)"></svg><p onclick="alert(1)">正文<a href="java&#x73;cript:alert(1)">链接</a><img src="https://example.org/tracker.png" /><img src="/media/sample.png" onerror="alert(1)" /></p>',
    )
    const serialized = JSON.stringify(parsed)
    expect(serialized).not.toMatch(/alert|script|onclick|onerror|iframe|tracker|svg|display:none/)
    expect(parsed.headings).toEqual([])
    expect(serialized).toContain('/media/sample.png')
    expect(serialized).toContain('正文')
  })
  it('同名标题生成唯一锚点，重新解析不会残留旧目录或用户 ID', () => {
    const first = parseSafeContent('<h2 id="evil">同名</h2><h3>同名</h3>', 'test')
    expect(first.headings.map(item => item.id)).toEqual(['test-section-1', 'test-section-2'])
    expect(parseSafeContent('<h2>更新</h2>', 'test').headings).toEqual([
      { id: 'test-section-1', text: '更新', level: 2 },
    ])
    expect(JSON.stringify(first.nodes)).not.toContain('evil')
  })
  it('链接与图片安全策略覆盖混淆协议、反斜杠、控制字符和编码绕过', () => {
    for (const href of [
      'javascript:alert(1)',
      'data:text/html,x',
      '//example.org',
      '/\\example.org',
      'https:\\example.org',
      'https://example.org/\u0000',
      '/%2fexample.org',
    ])
      expect(safeRichTextHref(href)).toBeUndefined()
    for (const href of ['https://example.org/path?q=1', '/resources/1', '#section-1'])
      expect(safeRichTextHref(href)).toBe(href)
    expect(isLocalImageUrl('/media/sample.svg')).toBe(false)
    expect(isLocalImageUrl('/api/academy/files/../secret')).toBe(false)
    expect(isLocalImageUrl('/media/sample.png')).toBe(true)
  })
  it('安全链接保留文字并附加新窗口隔离属性', () => {
    expect(parseSafeContent('<a href="https://example.org" target="evil">原文</a>').nodes).toEqual([
      {
        tag: 'a',
        attrs: { href: 'https://example.org', target: '_blank', rel: 'noopener noreferrer' },
        children: ['原文'],
      },
    ])
  })
})
