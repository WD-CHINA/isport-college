import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { createMockStore, validateNamespace, type MockSnapshot } from '@isport/api-client/mock'

/** 共享的是模拟数据库，不保存请求级会话或用户引用。 */
const stores = new Map<string, ReturnType<typeof createMockStore>>()

export function getMockStore(storageDir: string) {
  const root = resolve(storageDir || '.data/mock')
  let store = stores.get(root)
  if (!store) {
    store = createMockStore({
      async load(namespace) {
        try {
          return JSON.parse(
            await readFile(join(root, `${validateNamespace(namespace)}.json`), 'utf8'),
          ) as MockSnapshot
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
          throw error
        }
      },
      async save(namespace, snapshot) {
        await mkdir(root, { recursive: true })
        const destination = join(root, `${validateNamespace(namespace)}.json`)
        const temporary = `${destination}.${randomUUID()}.tmp`
        await writeFile(temporary, JSON.stringify(snapshot), { mode: 0o600 })
        await rename(temporary, destination)
      },
    })
    stores.set(root, store)
  }
  return store
}
