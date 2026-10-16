import type { WebContentCard, WebPage } from '@isport/shared'

/** total 包含下架关系，必须读取所有关系页才能得到有效内容的计数和连续分页。 */
export async function loadAccountActions(
  fetchPage: (pageNum: number) => Promise<WebPage<WebContentCard>>,
): Promise<WebContentCard[]> {
  const first = await fetchPage(1)
  const items = new Map(first.list.map(item => [item.contentKey, item]))
  const pages = Math.ceil(first.total / first.pageSize)
  for (let page = 2; page <= pages; page++) {
    const result = await fetchPage(page)
    for (const item of result.list) items.set(item.contentKey, item)
  }
  // 协议没有关系时间字段，保留后端的关系排序，不使用内容发布时间重排。
  return [...items.values()]
}
