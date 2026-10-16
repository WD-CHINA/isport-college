import { describe, expect, it } from 'vitest'
import { toContentMedia } from '../app/utils/content-media'
import type { WebMediaItem } from '@isport/shared'

describe('视频预览封面', () => {
  const video: WebMediaItem = {
    mediaType: 'VIDEO',
    fileUrl: '/video.webm',
    coverUrl: '/poster.png',
    durationSec: 1,
    pageCount: null,
  }
  const resolve = (url: string) => (url ? `https://api.example/academy${url}` : '')

  it('优先使用视频媒体封面，并保留部署前缀', () => {
    expect(toContentMedia([video], resolve, '/content.png')[0]).toMatchObject({
      url: 'https://api.example/academy/video.webm',
      poster: 'https://api.example/academy/poster.png',
    })
  })

  it('媒体无封面时使用内容封面，没有封面时保持为空', () => {
    const noPoster = { ...video, coverUrl: '' }
    expect(toContentMedia([noPoster], resolve, '/content.png')[0]?.poster).toBe(
      'https://api.example/academy/content.png',
    )
    expect(toContentMedia([noPoster], resolve)[0]?.poster).toBe('')
  })
})
