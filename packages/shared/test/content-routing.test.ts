import { describe, expect, it } from 'vitest'
import { webContentPath, type WebChannel, type WebDetailType } from '../src/web-api'

describe('webContentPath', () => {
  const channels: [WebChannel, string][] = [
    ['RESOURCE', 'resources'],
    ['RESEARCH', 'research'],
    ['SCHOOL', 'schools'],
  ]
  for (const [channel, source] of channels) {
    it(`${channel} 的文章使用统一富文本入口`, () => {
      expect(webContentPath({ channel, originId: 12, detailType: 'ARTICLE' })).toBe(
        `/preview/article/${source}/12`,
      )
    })

    it.each<WebDetailType>(['VIDEO', 'AUDIO', 'DOCUMENT', 'IMAGE'])(
      `${channel} 的 %s 使用统一资源入口并保留来源`,
      detailType => {
        expect(webContentPath({ channel, originId: 12, detailType })).toBe(
          `/preview/resource/${source}/12`,
        )
      },
    )

    it(`${channel} 的 LINK 不生成站内详情地址`, () => {
      expect(webContentPath({ channel, originId: 12, detailType: 'LINK' })).toBe('')
    })
  }
})
