/**
 * 深空版块 (Deep Space Board) - 页面 ①
 * 夜航论坛 · 怪谈区
 *
 * 设计目标：真实复现 2014-2016 年中国 PHP 论坛（Discuz! 风格）的版块页面。
 * 与解谜链对齐：本页面为序号 ①，右下角显示 1/29。
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
  /** unique key for visited-state tracking */
  id: string
  /** if true, clicking navigates to a real page */
  clickable?: boolean
  /** route to navigate to when clickable */
  route?: string
  /** sticky post */
  sticky?: boolean
  /** hot post */
  hot?: boolean
  /** new post indicator */
  isNew?: boolean
}

/** 生成 YYYY-MM-DD 格式日期（2014~2016 范围内） */
function randomDate(): string {
  const start = new Date(2014, 0, 1).getTime()
  const end = new Date(2016, 8, 25).getTime()
  const d = new Date(start + Math.random() * (end - start))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 每页显示帖子数 */
const PAGE_SIZE = 15
let currentPage = 1

const THREADS: ThreadData[] = [
  // ---- 置顶 ----
  { id: 'sticky-1', title: '深空版块版规（2014 年修订）', author: '霄汉', replies: 3, views: 2890, lastAuthor: '霄汉', lastTime: '2014-03-02', sticky: true },
  { id: 'sticky-2', title: '【索引】深空精华帖汇总', author: 'Vega', replies: 12, views: 4521, lastAuthor: 'Vega', lastTime: '2016-08-15', sticky: true },

  // ---- 普通帖子 ----
  { id: 'bus-13', title: '凌晨 3 点的 13 路公交车，我一个朋友的亲身经历', author: '七七', replies: 15, views: 1234, lastAuthor: '老王', lastTime: randomDate() },
  { id: 'crying-building', title: '老城区拆迁楼里的哭声，有谁听过？', author: 'flight左岸', replies: 8, views: 876, lastAuthor: '林小夕', lastTime: randomDate() },

  // ---- 可点击（解谜链关键帖） ----
  { id: 'exploration', title: '阳光新城旁废弃危房区探险', author: '往事随_风', replies: 23, views: 1856, lastAuthor: '隼', lastTime: '2016-03-14', clickable: true, route: '/post/exploration', hot: true },

  { id: 'school-well', title: '学校后山那口被封掉的井', author: 'fguwaeri', replies: 42, views: 3201, lastAuthor: 'rain_invein', lastTime: randomDate(), hot: true },
  { id: 'mirror-move', title: '我家的镜子会自己移动，已持续三个月', author: '午夜阳光', replies: 31, views: 2100, lastAuthor: '永不空军的钓鱼', lastTime: randomDate() },
  { id: 'air-raid-siren', title: '有人在深夜听到防空警报吗？坐标北郊', author: 'su123', replies: 7, views: 543, lastAuthor: '白夜', lastTime: randomDate() },
  { id: 'hospital-night', title: '医院太平间的值班记录（慎入）', author: 'deepblock', replies: 56, views: 4890, lastAuthor: '大雄小叮当', lastTime: randomDate() },
  { id: 'neighbor-upstairs', title: '楼上住户从未出过门', author: '安之若素@', replies: 67, views: 5678, lastAuthor: 'Autodesk', lastTime: randomDate(), hot: true },
  { id: 'phone-call-dead', title: '学校门口阿姨卖的鹅腿闪烁着诡异的绿光', author: '燕南三杯鸡赛高', replies: 45, views: 3987, lastAuthor: 'yummyyummy', lastTime: randomDate() },
  { id: 'abandoned-asylum', title: '市郊精神病院的废墟探险记录', author: '路人甲', replies: 28, views: 2345, lastAuthor: 'Alan', lastTime: randomDate() },
  { id: 'old-photo', title: '在老房子阁楼发现一张 1987 年的照片——里面的人我不认识', author: 'blue※berry', replies: 33, views: 2765, lastAuthor: '凉城', lastTime: randomDate() },
  { id: 'lost-hiker', title: '雾灵山失踪的徒步者搜救队说找到了不属于他的背包', author: 'jeffrey', replies: 48, views: 4567, lastAuthor: '葵向阳', lastTime: randomDate() },
  { id: 'sewer-noise', title: '下水道井盖下有敲击声但下面是死路', author: '北方的狼', replies: 19, views: 1567, lastAuthor: '深蓝', lastTime: randomDate() },
]

/** 总页数（显示 8 页，但只有第 1 页有内容） */
const TOTAL_PAGES = 8

/* ============================================================
   渲染
   ============================================================ */

function renderThreads(): void {
  const tbody = document.getElementById('thread-list')!
  const visited = getVisitedSet()

  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = THREADS.slice(start, start + PAGE_SIZE)

  tbody.innerHTML = pageItems.map((t) => {
    const icon = t.sticky ? '📌' : t.hot ? '🔥' : '📄'
    const iconClass = t.sticky ? 'icon-sticky' : t.hot ? 'icon-hot' : ''
    const rowClass = t.sticky ? 'thread-sticky' : t.hot ? 'thread-hot' : ''
    const prefix = t.sticky
      ? '<span class="prefix-sticky">置顶</span>'
      : t.hot
        ? '<span class="prefix-hot">热门</span>'
        : ''
    const newFlag = t.isNew ? '<span class="prefix-new">New</span>' : ''
    const visitedAttr = visited.has(t.id) ? ' data-visited="1"' : ''

    return `<tr class="${rowClass}">
      <td class="td-status"><span class="${iconClass}">${icon}</span></td>
      <td class="td-title">
        ${prefix}${newFlag}
        <a class="thread-link${t.clickable ? ' clickable-highlight' : ''}"${visitedAttr}
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

  // Bind click events for thread links
  tbody.querySelectorAll('.thread-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const id = (el as HTMLElement).dataset.id!
      const clickable = (el as HTMLElement).dataset.clickable === 'true'
      const route = (el as HTMLElement).dataset.route!

      markVisited(id)

      if (clickable && route) {
        addPathLog(`深空版块 → 点击帖子: ${(el as HTMLElement).textContent?.trim()}`)
        window.location.href = route
      } else {
        // Non-clickable: show a subtle dead-end toast
        showToast('该帖子暂无更多内容可查看')
      }
    })
  })
}

function renderPagination(): void {
  const container = document.getElementById('pagination')!
  let html = ''

  // Previous (always disabled — only page 1 accessible)
  html += `<span class="disabled">&laquo; 上一页</span>`

  // Page numbers
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    if (i === currentPage) {
      html += `<span class="page-current">${i}</span>`
    } else if (i === 1 || i === TOTAL_PAGES || Math.abs(i - currentPage) <= 2) {
      html += `<a href="#" class="page-num" data-page="${i}">${i}</a>`
    } else if (Math.abs(i - currentPage) === 3) {
      html += `<span class="page-dots">...</span>`
    }
  }

  // Next (always disabled — only page 1 accessible)
  html += `<span class="disabled">下一页 &raquo;</span>`

  container.innerHTML = html

  // Bind pagination clicks (only page 1 is accessible)
  container.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const page = parseInt((el as HTMLElement).dataset.page!, 10)
      if (page === 1 && currentPage !== 1) {
        currentPage = 1
        renderThreads()
        renderPagination()
        window.scrollTo(0, 0)
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
  // Update visual
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
        window.location.href = result.route
      }
    }
  }

  function doSearchQuery(): void {
    const query = input.value.trim()
    if (!query) return
    addSearchHistory(query)
    executeSearch(query)
    renderHistory()
  }

  // Search on button click
  btn.addEventListener('click', doSearchQuery)

  // Search on Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      doSearchQuery()
    }
  })

  // Focus → show panel with history
  input.addEventListener('focus', () => {
    historySection.classList.remove('hidden')
    resultSection.classList.add('hidden')
    renderHistory()
    panel.classList.remove('hidden')
  })

  // Click outside → close panel
  document.addEventListener('click', (e) => {
    const target = e.target as Node
    if (!panel.contains(target) && target !== input && target !== btn && !input.contains(target)) {
      panel.classList.add('hidden')
    }
  })

  // Clear history
  clearBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Clear search_history in state
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

  // Remove old listeners by cloning
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
      window.location.href = route
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
  // Track visit
  addPathLog('进入深空版块（怪谈区）')

  // Render threads
  renderThreads()

  // Render pagination
  renderPagination()

  // Search
  initSearch()

  // Apply visited styles on load
  const visited = getVisitedSet()
  visited.forEach(id => {
    document.querySelectorAll(`.thread-link[data-id="${id}"]`).forEach(el => {
      el.classList.add('visited')
    })
  })

  // Scroll to top on load (simulates real page load)
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
