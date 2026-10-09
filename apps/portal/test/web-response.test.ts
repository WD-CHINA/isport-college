import { describe, expect, it } from 'vitest'

import { resolveApiUrl } from '../app/utils/api-url'
import { toWebProfile } from '../app/utils/profile'

describe('展示层整理学苑响应', () => {
  it('相对媒体地址补到接口域名', () => {
    expect(resolveApiUrl('/statics/video/learnAudio/demo.MP3', 'http://10.9.0.26:8090/')).toBe(
      'http://10.9.0.26:8090/statics/video/learnAudio/demo.MP3',
    )
    expect(resolveApiUrl('https://cdn.example/a.png', 'http://10.9.0.26:8090')).toBe(
      'https://cdn.example/a.png',
    )
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
