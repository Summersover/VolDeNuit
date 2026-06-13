/**
 * 塔台版块 (Tower Board) - 页面 ③
 * 夜航论坛 · 公告区
 *
 * 设计目标：真实复现公告版块样式。约 10 个公告帖子，
 * 仅关站公告（顶）与创站公告（底）可点击进入。
 * 与解谜链对齐：本页面为序号 ③，右下角显示 3/30。
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory } from '../../shared/state'
import { search as doSearch, getSearchHistory } from '../../shared/search'
import type { PasswordId, SearchResult } from '../../shared/types'

/* ============================================================
   帖子数据
   ============================================================ */

interface ThreadData {
  title: string
  author: string
  replies: number
  views: number
  lastAuthor: string
  lastTime: string
  id: string
  clickable?: boolean
  route?: string
  sticky?: boolean
  noHighlight?: boolean
}

const THREADS: ThreadData[] = [
  // ---- 置顶（关站公告） ----
  { id: 'shutdown', title: '因个人原因，夜航将于2016年10月1日零时起停止运营', author: '霄汉', replies: 5, views: 1890, lastAuthor: '冷眼', lastTime: '2016-09-25', sticky: true, clickable: true, route: '/post/shutdown', noHighlight: true },

  // ---- 中间公告（不可点击） ----
  { id: 'server-maintain', title: '关于近期服务器维护的通知', author: '霄汉', replies: 3, views: 456, lastAuthor: '霄汉', lastTime: '2016-08-15' },
  { id: 'upgrade-v23', title: '论坛升级公告（v2.3）', author: '霄汉', replies: 7, views: 892, lastAuthor: '霄汉', lastTime: '2016-06-01' },
  { id: 'mod-recruit-result', title: '新增深空版块版主招募结果', author: '霄汉', replies: 5, views: 623, lastAuthor: '霄汉', lastTime: '2016-03-20' },
  { id: 'copyright-notice', title: '关于规范转载内容的管理通知', author: '霄汉', replies: 2, views: 345, lastAuthor: '霄汉', lastTime: '2015-12-10' },
  { id: 'mid-autumn-result', title: '中秋活动获奖名单公布', author: '霄汉', replies: 12, views: 1100, lastAuthor: 'Vega', lastTime: '2015-09-28' },
  { id: 'data-migration', title: '论坛数据迁移公告', author: '霄汉', replies: 4, views: 534, lastAuthor: '霄汉', lastTime: '2015-06-15' },
  { id: 'mod-recruit', title: '新增版主招募公告', author: '霄汉', replies: 9, views: 876, lastAuthor: '霄汉', lastTime: '2015-03-01' },
  { id: 'register-open', title: '论坛注册开放通知', author: '霄汉', replies: 6, views: 789, lastAuthor: '霄汉', lastTime: '2014-08-20' },

  // ---- 底部（创站公告） ----
  { id: 'founding', title: '夜航正式起航 「 第一航次 」', author: '霄汉', replies: 15, views: 2345, lastAuthor: 'Vega', lastTime: '2014-06-29', clickable: true, route: '/post/founding' },
]

const PAGE_SIZE = 15
let currentPage = 1
const TOTAL_PAGES = 1

/* ============================================================
   渲染
   ============================================================ */

function renderThreads(): void {
  const tbody = document.getElementById('thread-list')!
  const visited = getVisitedSet()

  tbody.innerHTML = THREADS.map((t) => {
    const icon = t.sticky ? '📌' : '📄'
    const iconClass = t.sticky ? 'icon-sticky' : ''
    const rowClass = t.sticky ? 'thread-sticky' : ''
    const prefix = t.sticky ? '<span class="prefix-sticky">置顶</span>' : ''
    const visitedAttr = visited.has(t.id) ? ' data-visited="1"' : ''

    return `<tr class="${rowClass}">
      <td class="td-status"><span class="${iconClass}">${icon}</span></td>
      <td class="td-title">
        ${prefix}
        <a class="thread-link${t.clickable && !t.noHighlight ? ' clickable-highlight' : ''}"${visitedAttr}
           data-id="${t.id}"
           data-clickable="${t.clickable || false}"
           data-route="${t.route || ''}"
           href="${t.clickable && t.route ? t.route : 'javascript:void(0)'}">${t.title}</a>
        <span class="thread-meta">作者: ${t.author}</span>
      </td>
      <td class="td-author">${t.author}</td>
      <td class="td-replies"><span class="reply-num">${t.replies}</span> / ${t.views}</td>
      <td class="td-lastpost"><span class="last-author">${t.lastAuthor}</span><br />${t.lastTime}</td>
    </tr>`
  }).join('')

  // Bind click events
  tbody.querySelectorAll('.thread-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const id = (el as HTMLElement).dataset.id!
      const clickable = (el as HTMLElement).dataset.clickable === 'true'
      const route = (el as HTMLElement).dataset.route!

      markVisited(id)

      if (clickable && route) {
        addPathLog(`塔台版块 → 点击帖子: ${(el as HTMLElement).textContent?.trim()}`)
        window.open(route, '_blank')
      } else {
        showToast('该帖子暂无更多内容可查看')
      }
    })
  })
}

/* ---- 已读状态 ---- */

function getVisitedSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem('nf_visited_threads')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function markVisited(id: string): void {
  const set = getVisitedSet()
  set.add(id)
  sessionStorage.setItem('nf_visited_threads', JSON.stringify([...set]))
  document.querySelectorAll(`.thread-link[data-id="${id}"]`).forEach(el => {
    el.classList.add('visited')
    el.setAttribute('data-visited', '1')
  })
}

/* ---- Toast ---- */

function showToast(msg: string): void {
  const existing = document.querySelector('.forum-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = 'forum-toast'
  toast.textContent = msg
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#333',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '4px',
    fontSize: '13px',
    zIndex: '99999',
    opacity: '1',
    transition: 'opacity 0.4s',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  })
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 400)
  }, 1800)
}

/* ============================================================
   搜索
   ============================================================ */

function initSearch(): void {
  const input = document.getElementById('search-input') as HTMLInputElement
  const btn = document.getElementById('search-btn') as HTMLButtonElement
  const panel = document.getElementById('search-panel')!
  const historyContainer = document.getElementById('history-list')!
  const resultContainer = document.getElementById('result-body')!
  const historySection = document.getElementById('search-history')!
  const resultSection = document.getElementById('search-result')!
  const clearBtn = document.getElementById('clear-history')!

  function renderHistory(): void {
    const history = getSearchHistory()
    if (history.length === 0) {
      historyContainer.innerHTML = '<li style="color:#999;cursor:default;">暂无搜索记录</li>'
      return
    }
    historyContainer.innerHTML = history.map((h: string) =>
      `<li><span class="history-term">${escapeHtml(h)}</span></li>`
    ).join('')

    historyContainer.querySelectorAll('li').forEach((li, idx) => {
      li.addEventListener('click', () => {
        const term = history[idx]
        if (term) {
          input.value = term
          executeSearch(term)
        }
      })
    })
  }

  function executeSearch(query: string): void {
    const result: SearchResult = doSearch(query)

    panel.classList.remove('hidden')
    historySection.classList.add('hidden')
    resultSection.classList.remove('hidden')

    if (result.type === 'none') {
      resultContainer.innerHTML = '<span style="color:#999;">未找到相关结果</span>'
      return
    }

    const typeLabel = result.type === 'trigger' ? '外部页面' : '站内'
    resultContainer.innerHTML = `
      <span class="result-label">${escapeHtml(result.label)}</span>
      <span class="result-type">[${typeLabel}]</span>
    `
    resultContainer.style.cursor = 'pointer'
    resultContainer.onclick = () => {
      if (result.route) {
        addPathLog(`搜索 → ${result.label}`)
        window.open(result.route, '_blank')
      }
    }
  }

  function doSearchQuery(): void {
    const query = input.value.trim()
    if (!query) return
    executeSearch(query)
    renderHistory()
  }

  btn.addEventListener('click', doSearchQuery)

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      doSearchQuery()
    }
  })

  input.addEventListener('focus', () => {
    if (input.value.trim() !== '') return
    historySection.classList.remove('hidden')
    resultSection.classList.add('hidden')
    renderHistory()
    panel.classList.remove('hidden')
  })

  // Typing → hide panel immediately
  input.addEventListener('input', () => {
    if (input.value.trim() !== '') panel.classList.add('hidden')
  })

  document.addEventListener('click', (e) => {
    const target = e.target as Node
    if (!panel.contains(target) && target !== input && target !== btn && !input.contains(target)) {
      panel.classList.add('hidden')
    }
  })

  clearBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const history = getSearchHistory()
    history.forEach((h: string) => removeSearchHistory(h))
    renderHistory()
  })
}

function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/* ============================================================
   密码弹窗（通用组件）
   ============================================================ */

export function showPasswordOverlay(
  prompt: string,
  passwordId: PasswordId,
  route: string,
): void {
  const overlay = document.getElementById('password-overlay')!
  const promptEl = document.getElementById('password-prompt')!
  const input = document.getElementById('password-input') as HTMLInputElement
  const errorEl = document.getElementById('password-error')!
  const cancelBtn = document.getElementById('password-cancel')!
  const confirmBtn = document.getElementById('password-confirm')!

  promptEl.textContent = prompt
  errorEl.classList.add('hidden')
  input.value = ''
  overlay.classList.remove('hidden')
  input.focus()

  const newCancel = cancelBtn.cloneNode(true) as HTMLButtonElement
  const newConfirm = confirmBtn.cloneNode(true) as HTMLButtonElement
  cancelBtn.parentNode!.replaceChild(newCancel, cancelBtn)
  confirmBtn.parentNode!.replaceChild(newConfirm, confirmBtn)

  async function verify(): Promise<void> {
    const { checkPassword } = await import('../../shared/auth')
    const ok = await checkPassword(passwordId, input.value)

    if (ok) {
      overlay.classList.add('hidden')
      addPathLog(`密码验证成功 → ${route}`)
      window.open(route, '_blank')
    } else {
      errorEl.classList.remove('hidden')
      input.classList.add('shake')
      setTimeout(() => input.classList.remove('shake'), 300)
      input.value = ''
      input.focus()
    }
  }

  newCancel.addEventListener('click', () => {
    overlay.classList.add('hidden')
  })

  newConfirm.addEventListener('click', verify)

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verify()
  })
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入塔台版块（公告区）')
  renderThreads()

  const visited = getVisitedSet()
  visited.forEach(id => {
    document.querySelectorAll(`.thread-link[data-id="${id}"]`).forEach(el => {
      el.classList.add('visited')
    })
  })

  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', () => {
  init()
  initSearch()
})
