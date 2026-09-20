/* global process, URL, Buffer, console */
/**
 * E2E 本地接口服务器：模拟 isport-library 后端（/rsp 前缀、{code,msg,data} 包体）。
 * 应用代码始终请求真实接口，测试稳定性由本服务器保证（playwright webServer 拉起）。
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.E2E_API_PORT ?? 3200)

/** 1x1 透明 PNG，作为验证码图 */
const CAPTCHA_IMG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

/** 平台资源种子数据（字段对齐后端 LearnVideoVO） */
let rows = [
  resource(101, '少儿体适能训练营', '李铮', 90, 18, 1, true, '2026-10-12'),
  resource(102, '成人篮球提高课', '王昊然', 120, 20, 3, false, '2026-10-14'),
  resource(103, '儿童游泳启蒙班', '陈思雨', 60, 9, 1, true, '2026-10-17'),
  resource(104, '成人体适能评估课', '李铮', 60, 6, 2, false, '2026-10-19'),
  resource(105, '青少年足球战术课', '赵天宇', 120, 14, 4, false, '2026-10-21'),
  resource(106, '瑜伽拉伸放松课', '孙雅琪', 45, 11, 2, true, '2026-10-24'),
]
let nextId = 107

function resource(
  id,
  name,
  uploadUser,
  durationMin,
  viewCount,
  recommendedLevel,
  systemShared,
  createDate,
) {
  return {
    id,
    name,
    type: 0,
    duration: durationMin * 60,
    tag: `${name}简介`,
    createDate,
    recommendedLevel,
    systemShared,
    uploadUser,
    viewCount,
  }
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': '*',
}

function send(res, data, code = 200, msg = 'ok') {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', ...CORS })
  res.end(JSON.stringify({ code, msg, data }))
}

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    return res.end()
  }

  const url = new URL(req.url ?? '/', 'http://localhost')
  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}
    const path = url.pathname

    if (path === '/rsp/app/captcha')
      return send(res, { ckey: 'e2e-ckey', length: 4, base64Img: CAPTCHA_IMG })

    if (path === '/rsp/user/login') {
      // 验证码统一为 1234；错误时返回业务码验证登录失效链路
      if (body.captcha !== '1234') return send(res, null, 500, '验证码错误')
      return send(res, {
        id: 9001,
        roleId: 2,
        authorities: '',
        token: 'e2e-token',
        nickName: 'E2E 管理员',
        schoolName: 'E2E 学校',
      })
    }

    if (path === '/rsp/user/logout') return send(res, 'ok')

    if (path === '/rsp/resource/platform/list') {
      const filtered = body.name ? rows.filter(row => row.name.includes(body.name)) : rows
      const pageNum = Number(body.pageNum ?? 1)
      const pageSize = Number(body.pageSize ?? 10)
      return send(res, {
        total: filtered.length,
        rows: filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize),
      })
    }

    if (path === '/rsp/resource/platform/detail') {
      const found = rows.find(row => String(row.id) === url.searchParams.get('id'))
      return found ? send(res, found) : send(res, null, 404, '资源不存在')
    }

    if (path === '/rsp/resource/platform/view') {
      const found = rows.find(row => String(row.id) === url.searchParams.get('id'))
      if (found) found.viewCount += 1
      return send(res, 1)
    }

    if (path === '/rsp/resource/platform/add') {
      const created = { id: nextId++, duration: 0, viewCount: 0, type: 0, ...body }
      rows.push(created)
      return send(res, String(created.id))
    }

    if (path === '/rsp/resource/platform/edit') {
      const index = rows.findIndex(row => String(row.id) === String(body.id))
      if (index >= 0) rows[index] = { ...rows[index], ...body }
      return send(res, 'ok')
    }

    if (path === '/rsp/resource/platform/delete') {
      rows = rows.filter(row => String(row.id) !== url.searchParams.get('id'))
      return send(res, 'ok')
    }

    res.writeHead(404, CORS)
    res.end()
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.info(`[e2e-api] mock backend listening on http://127.0.0.1:${PORT}`)
})
