/* global process, URL, Buffer, console */
/** Test-only /api/v1 protocol server. No application code imports this module. */
import { createServer } from 'node:http'
import { setTimeout as delay } from 'node:timers/promises'
import { readFile } from 'node:fs/promises'

const port = Number(process.env.E2E_API_PORT ?? 3200)
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  'access-control-allow-headers': '*',
}
const actions = new Map()
let sequence = 0
const profile = id => ({
  id,
  phoneMask: '138****8000',
  nickname: `测试用户${id}`,
  avatarCode: 1,
  nicknamePromptNeeded: false,
  lingyueBound: false,
})
const profiles = new Map()
const state = token => {
  if (!actions.has(token)) actions.set(token, { LIKE: new Set(), FAVORITE: new Set() })
  return actions.get(token)
}
function send(res, data, status = 200, message = 'OK') {
  res.writeHead(status, { ...cors, 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ status, message, data }))
}
function card(id, channel = 'RESOURCE', english = false) {
  const detailType =
    { 2: 'VIDEO', 3: 'AUDIO', 4: 'DOCUMENT', 5: 'IMAGE', 6: 'DOCUMENT', 7: 'LINK', 9: 'VIDEO' }[
      id
    ] ?? 'ARTICLE'
  return {
    channel,
    origin: 'PLATFORM',
    originId: id,
    contentKey: `${channel}:${id}`,
    title: english ? `Resource ${id}` : `资源示例 ${id}`,
    summary: english ? 'Teaching example' : '教学资源示例',
    coverUrl: '/media/sample.png',
    detailType,
    categoryCode: channel === 'RESOURCE' ? '1' : channel === 'RESEARCH' ? 'SERIES' : 'DIGITAL',
    categoryName: english ? 'Fitness' : '体能',
    authorName: '测试作者',
    provinceName: '上海',
    schoolName: '测试学校',
    viewCount: 10,
    likeCount: 2,
    favoriteCount: 3,
    interactive: true,
    publishedAt: 1791504000000,
  }
}
function detail(id, channel, english, token) {
  const value = card(id, channel, english)
  const file = {
    2: 'sample.webm',
    3: 'sample.wav',
    4: 'sample.pdf',
    5: 'sample.png',
    6: 'slides.pptx',
    9: 'missing.webm',
  }[id]
  const mediaType = {
    2: 'VIDEO',
    3: 'AUDIO',
    4: 'DOCUMENT',
    5: 'IMAGE',
    6: 'DOCUMENT',
    9: 'VIDEO',
  }[id]
  return {
    ...value,
    description: value.summary,
    htmlBody:
      id === 10
        ? '<p><img src="/media/sample.png" alt="课堂实践一"><img src="/media/sample.png" alt="课堂实践二"></p><p>文章详情布局回归正文。</p><h2>课堂实践</h2><p>保持正文、互动和推荐相互独立。</p><script>alert("unsafe")</script>'
        : '<h2>资源正文</h2><p>这是可独立加载的教学正文。</p><script>alert("unsafe")</script>',
    jumpUrl: 'https://example.com/lesson',
    resourceType: null,
    mediaList: file
      ? (id === 5 ? [1, 2, 3] : [1]).map(index => ({
          mediaType,
          fileUrl: `/media/${file}${id === 5 ? `?image=${index}` : ''}`,
          coverUrl: '',
          durationSec: 1,
          pageCount: 1,
        }))
      : [],
    liked: state(token).LIKE.has(value.contentKey),
    favorited: state(token).FAVORITE.has(value.contentKey),
  }
}
const teacher = {
  id: 1,
  name: '张老师',
  schoolOrg: '测试学校',
  jobTitle: '体育教师',
  honorTitle: '优秀教师',
  avatarUrl: '/media/sample.png',
  story: '<p>教师故事</p>',
}
const news = {
  id: 1,
  categoryCode: 'NEWS',
  categoryName: '新闻',
  title: '行业动态示例',
  summary: '体育教学动态',
  coverUrl: '/media/sample.png',
  detailType: 'ARTICLE',
  jumpUrl: '',
  htmlBody: '<p>动态正文</p>',
  publishedAt: 1791504000000,
}
function page(rows, query) {
  const pageNum = Number(query.get('pageNum') ?? 1)
  const pageSize = Number(query.get('pageSize') ?? 12)
  return {
    total: rows.length,
    pageNum,
    pageSize,
    list: rows.slice((pageNum - 1) * pageSize, pageNum * pageSize),
  }
}
const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors)
      return res.end()
    }
    const url = new URL(req.url ?? '/', `http://localhost:${port}`)
    if (url.pathname.startsWith('/media/')) {
      const name = url.pathname.slice(7)
      if (!['sample.png', 'sample.pdf', 'sample.wav', 'sample.webm'].includes(name))
        return send(res, null, 404, 'Not found')
      const data = await readFile(new URL(`../public/media/${name}`, import.meta.url))
      const mime = {
        png: 'image/png',
        pdf: 'application/pdf',
        wav: 'audio/wav',
        webm: 'video/webm',
      }[name.split('.').pop()]
      res.writeHead(200, { ...cors, 'content-type': mime, 'content-length': data.length })
      return res.end(data)
    }
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
    const path = url.pathname.replace(/^\/api\/v1/, '')
    const token = String(req.headers.authorization ?? '').replace(/^Bearer /, '')
    const id = Number(/^e2e-(\d+)-/.exec(token)?.[1] ?? 1)
    const english = req.headers['x-locale'] === 'en-US'
    if (path === '/health') return send(res, true)
    if (path === '/auth/sms') return send(res, undefined)
    if (path === '/auth/login') {
      if (body.code !== '123456' || body.agreed !== true) return send(res, null, 400, '验证码错误')
      return send(res, { token: `e2e-1-login-${++sequence}`, newUser: false, profile: profile(1) })
    }
    if (path === '/auth/logout') return send(res, undefined)
    if (path.startsWith('/me') || path.startsWith('/actions/')) {
      if (token.includes('slow-me') && path === '/me') await delay(3000)
      if (!token || token.includes('expired')) return send(res, null, 401, '登录已过期')
      if (path === '/me') return send(res, profiles.get(token) ?? profile(id))
      if (path === '/me/lingyue/launch') {
        const current = profiles.get(token) ?? profile(id)
        if (!current.lingyueBound && body.authorized !== true)
          return send(res, null, 400, '请先授权关联灵跃账号')
        const target = ['home', 'agent', 'chat'].includes(body.target) ? body.target : 'home'
        const agentCode = typeof body.agentCode === 'string' ? body.agentCode : ''
        const updated = { ...current, lingyueBound: true }
        profiles.set(token, updated)
        const agentQuery = agentCode ? `&agentCode=${encodeURIComponent(agentCode)}` : ''
        return send(res, {
          launchUrl: `https://lingyue.dream-sports.cn/launch?token=e2e&target=${target}${agentQuery}`,
          expiresIn: 300,
          lingyueBound: true,
        })
      }
      if (path === '/me/nickname' || path === '/me/avatar') {
        const updated = {
          ...(profiles.get(token) ?? profile(id)),
          ...(path.endsWith('nickname')
            ? { nickname: body.nickname }
            : { avatarCode: body.avatarCode }),
        }
        profiles.set(token, updated)
        return send(res, updated)
      }
      if (path === '/me/nickname-prompt') return send(res, undefined)
      if (path === '/me/actions') {
        const action = url.searchParams.get('action') ?? 'FAVORITE'
        const channel = url.searchParams.get('channel')
        const rows = [...state(token)[action]]
          .map(key => {
            const [kind, value] = key.split(':')
            return card(Number(value), kind, english)
          })
          .filter(row => !channel || row.channel === channel)
        return send(res, page(rows, url.searchParams))
      }
      if (path === '/actions/like' || path === '/actions/favorite') {
        const kind = path.endsWith('like') ? 'LIKE' : 'FAVORITE'
        const key = `${body.channel}:${body.originId}`
        const items = state(token)[kind]
        if (items.has(key)) items.delete(key)
        else items.add(key)
        return send(res, {
          active: items.has(key),
          count: (kind === 'LIKE' ? 2 : 3) + Number(items.has(key)),
        })
      }
    }
    if (path === '/avatars') return send(res, [1, 2, 3, 4])
    if (path === '/contents/view') return send(res, undefined)
    if (path === '/contents/recommend') {
      if (url.searchParams.get('originId') === '8')
        return send(res, null, 503, 'Service unavailable')
      const channel = url.searchParams.get('channel') ?? 'RESOURCE'
      const source = card(Number(url.searchParams.get('originId')), channel, english)
      return send(
        res,
        (channel === 'RESOURCE' && source.detailType !== 'ARTICLE' ? [1, 2, 3] : [1]).map(id =>
          card(id, channel, english),
        ),
      )
    }
    if (path === '/resources/filters')
      return send(res, {
        categoryList: [
          { id: '1', name: english ? 'Fitness' : '体能' },
          { id: '2', name: english ? 'Sports' : '专项运动' },
        ],
        secondCategoryList: [{ id: '10', name: '力量', parentId: '1' }],
        levelList: [1, 2, 3, 4, 5].map(id => ({
          id: String(id),
          name: `水平 ${id}`,
        })),
        bodyPartList: [{ id: '4', name: '上肢' }],
        typeList: ['0', '1', '2', '5', '6'].map(id => ({ id, name: `类型 ${id}` })),
      })
    if (path === '/home')
      return send(res, {
        featuredList: [card(1, 'RESOURCE', english)],
        // 保留多个空分区，验证首页并列空状态和语言切换的水合行为。
        hotList: [],
        resourceGroupList: [
          {
            groupId: 1,
            groupName: english ? 'Fitness' : '体能',
            itemList: [
              { ...card(1, 'RESOURCE', english), levelName: english ? 'Level 1' : '水平一' },
            ],
          },
          { groupId: 2, groupName: english ? 'Sports' : '专项运动', itemList: [] },
        ],
        levelGroupList: [
          {
            groupId: 3,
            groupName: '水平三',
            itemList: [{ ...card(3, 'RESOURCE', english), recommendedLevel: 3 }],
          },
          { groupId: 5, groupName: '水平五', itemList: [] },
        ],
        researchList: [card(1, 'RESEARCH', english)],
        schoolList: [],
        teacherList: [teacher],
        newsList: [news],
      })
    if (/^\/(resources|research|schools|teachers|news)\/997$/.test(path))
      return send(res, null, 503, 'Service unavailable')
    if (/^\/(resources|research|schools|teachers|news)\/998$/.test(path))
      return send(res, null, 400, '内容不存在或已下架')
    const match = /^\/(resources|research|schools)(?:\/(\d+))?$/.exec(path)
    if (match) {
      const channel = { resources: 'RESOURCE', research: 'RESEARCH', schools: 'SCHOOL' }[match[1]]
      if (match[2]) {
        const originId = Number(match[2])
        return originId > 0 && originId <= 24
          ? send(res, detail(originId, channel, english, token))
          : send(res, null, 404, '内容不存在')
      }
      const keyword = url.searchParams.get('keyword')
      const paginationFixture = channel === 'RESOURCE' && keyword === '分页样例'
      let rows = Array.from({ length: paginationFixture ? 72 : 24 }, (_, index) => ({
        ...card(index + 1, channel, english),
        ...(paginationFixture ? { title: `分页样例 ${index + 1}` } : {}),
      }))
      if (keyword) rows = rows.filter(row => row.title.includes(keyword))
      return send(res, page(rows, url.searchParams))
    }
    if (path === '/teachers') return send(res, page([teacher], url.searchParams))
    if (path === '/teachers/1') return send(res, teacher)
    if (path === '/news') return send(res, page([news], url.searchParams))
    if (path === '/news/1') return send(res, news)
    return send(res, null, 404, 'Not found')
  } catch (error) {
    console.error(error)
    if (!res.headersSent) send(res, null, 500, 'Test server failure')
  }
})
server.listen(port, '127.0.0.1', () => console.info(`[e2e-api] http://127.0.0.1:${port}`))
