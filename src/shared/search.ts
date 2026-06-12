import type { SearchResult } from './types'
import { getState, addSearchHistory } from './state'

/* ---- 内部类型 ---- */

interface SearchEntry {
  /** 该条目对应的所有关键词（原始写法，匹配时统一归一化） */
  keywords: string[]
  /** 跳转路径 */
  route: string
  /** 下拉面板中显示的文本 */
  label: string
}

/* ---- 触发搜索表（返回外部独立页面） ---- */

const TRIGGER_SEARCHES: SearchEntry[] = [
  {
    keywords: ['阳光新城'],
    route: '/external/news',
    label: '阳光新城小区新闻报道',
  },
  {
    keywords: ['正造集团', '正造地产集团'],
    route: '/external/zhengzao',
    label: '正造集团官网',
  },
  {
    keywords: ['徐山'],
    route: '/external/missing',
    label: '徐山失踪档案',
  },
  {
    keywords: ['正造招聘 2013'],
    route: '/external/zhengzao/recruitment',
    label: '正造集团招聘存档（2013）',
  },
  {
    keywords: ['Vol de Nuit', 'VoldeNuit', 'vol de nuit', 'voldenuit', '夜航'],
    route: '/saint-exupery/',
    label: '圣埃克苏佩里百科页',
  },
  {
    keywords: ['徐天'],
    route: '/memoir/xutian.html',
    label: '徐天回忆录',
  },
]

/* ---- 普通搜索表（返回论坛站内结果） ---- */

const NORMAL_SEARCHES: SearchEntry[] = [
  {
    keywords: ['地窖'],
    route: '/post/cellar',
    label: '隼的调查帖',
  },
  {
    keywords: ['波利比奥斯'],
    route: '/post/polybius',
    label: '波利比奥斯科普帖',
  },
  {
    keywords: ['beacon_holder'],
    route: '/user/beacon_holder',
    label: 'beacon_holder的个人主页',
  },
  {
    keywords: ['Gambit', 'gambit'],
    route: '/user/gambit',
    label: 'Gambit的个人主页',
  },
  {
    keywords: ['Vega'],
    route: '/post/favorite-sentence',
    label: '大家最喜欢的句子（Vega在该帖中出现）',
  },
]

/* ---- 归一化匹配 ---- */

/**
 * 搜索词归一化：转小写 → 去空格 → 去标点符号
 * 保留字母、数字、中文（CJK 统一表意文字）
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9一-鿿]/g, '')
}

/** 精确匹配（两侧均归一化后对比） */
function match(input: string, keyword: string): boolean {
  return normalize(input) === normalize(keyword)
}

/** 在搜索表中查找命中项 */
function findInTable(
  input: string,
  table: SearchEntry[],
): SearchEntry | undefined {
  for (const entry of table) {
    if (entry.keywords.some(kw => match(input, kw))) {
      return entry
    }
  }
  return undefined
}

/* ---- 公开 API ---- */

/**
 * 执行搜索
 * 1. 先查触发搜索表（外部页面）
 * 2. 再查普通搜索表（站内结果）
 * 3. 均未命中 → { type: 'none', label: 'No result' }
 *
 * 命中关键词的记录自动记入搜索历史（search_history）
 */
export function search(query: string): SearchResult {
  const trimmed = query.trim()
  if (!trimmed) return { type: 'none', label: 'No result' }

  // ① 触发搜索
  const triggerHit = findInTable(trimmed, TRIGGER_SEARCHES)
  if (triggerHit) {
    addSearchHistory(triggerHit.keywords[0])
    return {
      type: 'trigger',
      label: triggerHit.label,
      route: triggerHit.route,
    }
  }

  // ② 普通搜索
  const normalHit = findInTable(trimmed, NORMAL_SEARCHES)
  if (normalHit) {
    addSearchHistory(normalHit.keywords[0])
    return {
      type: 'normal',
      label: normalHit.label,
      route: normalHit.route,
    }
  }

  // ③ 无结果（不记入历史）
  return { type: 'none', label: 'No result' }
}

/** 获取搜索历史（按时间倒序） */
export function getSearchHistory(): string[] {
  return getState('search_history')
}

/** 根据关键词查路由（用于外部直接链接跳转） */
export function getRouteByKeyword(keyword: string): string | undefined {
  const trimmed = keyword.trim()
  const hit =
    findInTable(trimmed, TRIGGER_SEARCHES) ??
    findInTable(trimmed, NORMAL_SEARCHES)
  return hit?.route
}
