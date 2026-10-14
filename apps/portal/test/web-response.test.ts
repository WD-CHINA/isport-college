import { describe, expect, it } from 'vitest'

import { resolveApiUrl } from '../app/utils/api-url'
import { toWebProfile } from '../app/utils/profile'

describe('展示层整理学苑响应', () => {
  it.each(['', '/'])('同源部署保留静态资源相对路径 %s', baseURL => {
    expect(resolveApiUrl(' /statics/demo.png ', baseURL)).toBe('/statics/demo.png')
    expect(resolveApiUrl('https://cdn.example/a.png', baseURL)).toBe('https://cdn.example/a.png')
    expect(resolveApiUrl(undefined, baseURL)).toBe('')
  })
  it('相对媒体地址补到接口域名', () => {
    expect(resolveApiUrl('/statics/video/learnAudio/demo.MP3', 'http://10.9.0.26:8090/')).toBe(
      'http://10.9.0.26:8090/statics/video/learnAudio/demo.MP3',
    )
    expect(resolveApiUrl('https://cdn.example/a.png', 'http://10.9.0.26:8090')).toBe(
      'https://cdn.example/a.png',
    )
    expect(
      resolveApiUrl('/statics/demo.png', 'https://yuntiyu-test2.dream-sports.cn/academy'),
    ).toBe('https://yuntiyu-test2.dream-sports.cn/academy/statics/demo.png')
  })

  it('资料缺字段时补成会话可用的形状', () => {
    expect(
      toWebProfile({
        id: 8,
        phoneMask: '138****8000',
        nickname: null,
        avatarCode: 0,
        nicknamePromptNeeded: true,
      }),
    ).toEqual({
      id: 8,
      phoneMask: '138****8000',
      nickname: '',
      avatarCode: 1,
      nicknamePromptNeeded: true,
    })
    expect(toWebProfile({ id: '8' })).toBeNull()
  })
})

import {
  parseContentCard,
  parseContentDetail,
  parseHome,
  parsePage,
  parseAction,
  parseFilters,
} from '../app/utils/web-response'
import { ApiError, apiErrorCode } from '../app/api/errors'

const card = {
  channel: 'RESOURCE',
  origin: 'PLATFORM',
  originId: 1,
  contentKey: 'resource-1',
  title: '资源',
  detailType: 'ARTICLE',
  viewCount: 0,
  likeCount: 0,
  favoriteCount: 0,
}

describe('调用侧协议验证', () => {
  it('筛选接口根选项可省略 parentId，二级分类仍保留父级关联', () => {
    const filters = {
      categoryList: [
        { id: '1', name: '体能' },
        { id: '2', name: '专项技能', parentId: null },
      ],
      secondCategoryList: [{ id: '6', name: '肌肉力量', parentId: '1' }],
      levelList: [{ id: '3', name: '水平三' }],
      bodyPartList: [{ id: '83', name: '上肢' }],
      typeList: [{ id: '0', name: '视频' }],
    }
    const parsed = parseFilters(filters)
    expect(parsed.categoryList).toEqual([
      { id: '1', name: '体能', parentId: null },
      { id: '2', name: '专项技能', parentId: null },
    ])
    expect(parsed.secondCategoryList[0]?.parentId).toBe('1')
    for (const field of ['levelList', 'bodyPartList', 'typeList'] as const)
      expect(parsed[field][0]?.parentId).toBeNull()
    for (const parentId of [1, false, {}, []])
      expect(() =>
        parseFilters({ ...filters, categoryList: [{ id: '1', name: '体能', parentId }] }),
      ).toThrow(ApiError)
  })
  it('拒绝畸形首页、列表、枚举和计数，不让模板解引用异常', () => {
    for (const value of [null, {}, { featuredList: [] }])
      expect(() => parseHome(value)).toThrow(ApiError)
    expect(() =>
      parsePage({ total: 1, pageNum: 1, pageSize: 12, list: null }, parseContentCard),
    ).toThrow(ApiError)
    expect(() => parseContentCard({ ...card, detailType: 'UNKNOWN' })).toThrow(ApiError)
    expect(() => parseContentCard({ ...card, likeCount: -1 })).toThrow(ApiError)
    expect(() => parseAction({ active: 'yes', count: 1 })).toThrow(ApiError)
    expect(() => parseFilters({ categoryList: {} })).toThrow(ApiError)
  })
  it('可选展示字段归一化，不同媒体仍保留协议信息', () => {
    expect(parseContentCard(card)).toMatchObject({
      summary: '',
      publishedAt: null,
      interactive: true,
    })
    expect(
      parseContentDetail({ ...card, mediaList: [{ mediaType: 'DOCUMENT', fileUrl: '/a.pdf' }] })
        .mediaList[0],
    ).toMatchObject({ mediaType: 'DOCUMENT', fileUrl: '/a.pdf', pageCount: null })
  })
  it('错误经过 Nuxt JSON 序列化仍可识别业务码', () => {
    const error = ApiError.notFound('已下架')
    const restored = JSON.parse(
      JSON.stringify({ message: error.message, statusCode: error.statusCode, data: error.data }),
    )
    expect(apiErrorCode(restored)).toBe('NOT_FOUND')
    expect(restored.statusCode).toBe(404)
    expect(apiErrorCode({ data: { code: 'unexpected' } })).toBeUndefined()
  })
})
