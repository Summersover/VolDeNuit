/**
 * 候机室版块 (Lounge Board) - 页面 ②
 * 夜航论坛 · 水区
 *
 * 设计目标：真实复现论坛水区版块。约 28 个闲聊水帖，分 2 页显示。
 * 第一页含"站长多大了""大家最喜欢的句子"两个关键帖，
 * 第二页含"2015中秋晒月亮活动获奖作品"。
 * 与解谜链对齐：本页面为序号 ②，右下角显示 2/29。
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
  hot?: boolean
}

function randomDate(): string {
  const start = new Date(2014, 5, 29).getTime()
  const end = new Date(2016, 8, 20).getTime()
  const d = new Date(start + Math.random() * (end - start))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const TOTAL_THREADS = 28
const THREADS: ThreadData[] = [
  // ---- 置顶 ----
  { id: 'lounge-sticky-1', title: '候机室版规（2014 年修订）', author: '霄汉', replies: 3, views: 2150, lastAuthor: '霄汉', lastTime: '2014-07-20', sticky: true },
  { id: 'lounge-sticky-2', title: '【索引】候机室精彩帖子汇总', author: 'Vega', replies: 8, views: 3890, lastAuthor: 'Vega', lastTime: '2016-06-20', sticky: true },

  // ---- 第一页（1~15）：含两个关键帖 ----
  { id: 'lounge-1', title: '好想半夜跑出去唱K然后漫无目的乱逛啊', author: '小心花仙炮', replies: 12, views: 876, lastAuthor: '芝士', lastTime: randomDate() },
  { id: 'how-old', title: '站长多大了', author: '二北', replies: 22, views: 2100, lastAuthor: '霄汉', lastTime: '2014-07-03', clickable: true, route: '/post/how-old' },
  { id: 'lounge-2', title: '大家周末一般做什么', author: '别再迷恋哥', replies: 56, views: 4321, lastAuthor: '蓝色雨', lastTime: randomDate(), hot: true },
  { id: 'lounge-3', title: '居酒屋下次去哪里happy', author: '钱憨', replies: 38, views: 2987, lastAuthor: '花花❀', lastTime: randomDate() },
  { id: 'lounge-4', title: '这次能上岸吗球球了', author: '青空落', replies: 9, views: 654, lastAuthor: '阿信', lastTime: randomDate() },
  { id: 'lounge-5', title: '深夜报社——发一下你手机里最好吃的一张图', author: 'deahwi098', replies: 67, views: 5678, lastAuthor: '雪落无痕', lastTime: randomDate(), hot: true },
  { id: 'lounge-6', title: '好怀念本科时在南楼的日子', author: '大叶黄杨堡', replies: 31, views: 2345, lastAuthor: '觉来江南犹一梦', lastTime: randomDate() },
  { id: 'lounge-7', title: '你们会删掉以前发的朋友圈吗', author: '匆匆过客', replies: 24, views: 1876, lastAuthor: 'Alan', lastTime: randomDate() },
  { id: 'favorite-sentence', title: '大家最喜欢的句子', author: '麦麦', replies: 45, views: 3678, lastAuthor: 'Vega', lastTime: '2016-08-15', clickable: true, route: '/post/favorite-sentence' },
  { id: 'lounge-8', title: '最近在单曲循环的一首歌', author: 'blueberry', replies: 43, views: 3456, lastAuthor: '风行者', lastTime: randomDate(), hot: true },
  { id: 'lounge-9', title: '北京实在是太美食荒漠了有没有懂的', author: '精神川湘人', replies: 17, views: 1234, lastAuthor: '凉笙', lastTime: randomDate() },
  { id: 'lounge-10', title: '可以不上班在草坪听一晚上歌吗', author: 'C303谁没来', replies: 28, views: 2100, lastAuthor: '栀', lastTime: randomDate() },
  { id: 'lounge-11', title: '分享一个你最近去过的最安静的地方', author: '陆小北', replies: 15, views: 1098, lastAuthor: '青釉', lastTime: randomDate() },
  { id: 'lounge-12', title: '有没有什么小众的爱好', author: '花落无声', replies: 33, views: 2654, lastAuthor: '昼', lastTime: randomDate() },
  { id: 'lounge-13', title: '今天天气不错，拍张窗外的照片吧', author: '小王子', replies: 19, views: 1567, lastAuthor: 'rainbow', lastTime: randomDate() },

  // ---- 第二页（16~28）：含月亮照片帖 ----
  { id: 'moon-photo', title: '2015中秋晒月亮活动获奖作品', author: '霄汉', replies: 34, views: 2890, lastAuthor: 'Vega', lastTime: '2015-09-28', clickable: true, route: '/post/moon-photo' },
  { id: 'lounge-14', title: '说说你最近的一个小目标', author: 'william', replies: 26, views: 1987, lastAuthor: '阿辰', lastTime: randomDate() },
  { id: 'lounge-15', title: '你们一般几点睡', author: 'catherine', replies: 41, views: 3456, lastAuthor: '青空', lastTime: randomDate(), hot: true },
  { id: 'lounge-16', title: '推荐一本书吧，什么类型的都行', author: '栀', replies: 37, views: 2876, lastAuthor: '橘', lastTime: randomDate() },
  { id: 'lounge-17', title: '大家会用方言打字吗', author: '行客', replies: 16, views: 1232, lastAuthor: '末', lastTime: randomDate() },
  { id: 'lounge-18', title: '说说你坚持最久的一个习惯', author: '阿信', replies: 23, views: 1765, lastAuthor: '凉笙', lastTime: randomDate() },
  { id: 'lounge-19', title: '今天遇到一件特别无语的事', author: '川', replies: 29, views: 2134, lastAuthor: '昼', lastTime: randomDate() },
  { id: 'lounge-20', title: '你们会收藏一些奇怪的帖子吗', author: '追风少年', replies: 14, views: 987, lastAuthor: '风', lastTime: randomDate() },
  { id: 'lounge-21', title: '有没有人一起组队学英语', author: 'dolphin', replies: 21, views: 1654, lastAuthor: '芝士', lastTime: randomDate() },
  { id: 'lounge-22', title: '最近在追什么剧', author: '墨', replies: 35, views: 2765, lastAuthor: '浮游', lastTime: randomDate(), hot: true },
  { id: 'lounge-23', title: '如果你能瞬间学会一项技能，选什么', author: '冷雨夜', replies: 44, views: 3567, lastAuthor: 'glimmer', lastTime: randomDate() },
  { id: 'lounge-24', title: '大家还记得自己第一次上网是什么时候吗', author: '风行者', replies: 52, views: 4321, lastAuthor: '青空', lastTime: randomDate(), hot: true },
  { id: 'lounge-25', title: '说一件你小时候深信不疑的事情', author: '过客', replies: 27, views: 2100, lastAuthor: '半梦', lastTime: randomDate() },
]

const PAGE_SIZE = 15
let currentPage = 1
/** 总页数（按统计栏 21,286 个主题 ÷ 15 计算） */
const TOTAL_PAGES = 1420

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
    const visitedAttr = visited.has(t.id) ? ' data-visited="1"' : ''

    return `<tr class="${rowClass}">
      <td class="td-status"><span class="${iconClass}">${icon}</span></td>
      <td class="td-title">
        ${prefix}
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

  tbody.querySelectorAll('.thread-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const id = (el as HTMLElement).dataset.id!
      const clickable = (el as HTMLElement).dataset.clickable === 'true'
      const route = (el as HTMLElement).dataset.route!

      markVisited(id)

      if (clickable && route) {
        addPathLog(`候机室版块 → 点击帖子: ${(el as HTMLElement).textContent?.trim()}`)
        window.location.href = route
      } else {
        showToast('该帖子暂无更多内容可查看')
      }
    })
  })
}

function renderPagination(): void {
  const container = document.getElementById('pagination')!
  let html = ''

  html += currentPage > 1
    ? `<a href="#" class="page-prev" data-page="${currentPage - 1}">&laquo; 上一页</a>`
    : `<span class="disabled">&laquo; 上一页</span>`

  // Show page numbers with ellipsis for many pages
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    if (i === currentPage) {
      html += `<span class="page-current">${i}</span>`
    } else if (i === 1 || i === TOTAL_PAGES || Math.abs(i - currentPage) <= 5) {
      html += `<a href="#" class="page-num" data-page="${i}">${i}</a>`
    } else if (Math.abs(i - currentPage) === 9) {
      html += `<span class="page-dots">...</span>`
    }
  }

  html += currentPage < 2
    ? `<a href="#" class="page-next" data-page="${currentPage + 1}">下一页 &raquo;</a>`
    : `<span class="disabled">下一页 &raquo;</span>`

  container.innerHTML = html

  container.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const page = parseInt((el as HTMLElement).dataset.page!, 10)
      // Only pages 1-2 have content; pages 3+ are decorative
      if (page > 2) return
      if (page === currentPage) return
      currentPage = page
      renderThreads()
      renderPagination()
      window.scrollTo(0, 0)
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

  btn.addEventListener('click', doSearchQuery)

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      doSearchQuery()
    }
  })

  input.addEventListener('focus', () => {
    historySection.classList.remove('hidden')
    resultSection.classList.add('hidden')
    renderHistory()
    panel.classList.remove('hidden')
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
   密码弹窗
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
      window.location.href = route
    } else {
      errorEl.classList.remove('hidden')
      input.classList.add('shake')
      setTimeout(() => input.classList.remove('shake'), 300)
      input.value = ''
      input.focus()
    }
  }

  newCancel.addEventListener('click', () => { overlay.classList.add('hidden') })
  newConfirm.addEventListener('click', verify)
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') verify() })
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入候机室版块（水区）')
  renderThreads()
  renderPagination()

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
