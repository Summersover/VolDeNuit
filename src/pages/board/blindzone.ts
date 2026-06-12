/**
 * 盲区版块 (Blind Zone Board) - 页面 ④
 * 夜航论坛 · 归档
 *
 * 两个留档日志文件，分别需密码E和密码F解锁。
 * 与解谜链对齐：本页面为序号 ④，右下角显示 4/30。
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory, unlock } from '../../shared/state'
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
  route: string
  /** 该帖子所需的密码，解锁后才可点击进入 */
  requiredPassword: PasswordId
  /** 弹窗提示文字 */
  passwordPrompt: string
}

const THREADS: ThreadData[] = [
  {
    id: 'archive-1',
    title: '盲区存档Ⅰ',
    author: '霄汉',
    replies: 0,
    views: 1,
    lastAuthor: '霄汉',
    lastTime: '2016-09-29',
    route: '/blindzone/entry/1',
    requiredPassword: 'E',
    passwordPrompt: '请输入密钥以解锁盲区',
  },
  {
    id: 'archive-2',
    title: '盲区存档Ⅱ',
    author: '霄汉',
    replies: 0,
    views: 1,
    lastAuthor: '霄汉',
    lastTime: '2016-09-29',
    route: '/blindzone/entry/2',
    requiredPassword: 'F',
    passwordPrompt: '请输入密钥以解锁存档Ⅱ',
  },
]

/* ============================================================
   已解锁状态
   ============================================================ */

/**
 * 从 localStorage 检查某密码是否已解锁
 */
function isPasswordUnlocked(pwId: PasswordId): boolean {
  const key = ('pw_' + pwId.toLowerCase()) as 'pw_e' | 'pw_f'
  const raw = localStorage.getItem('nf_' + key)
  if (!raw) return false
  try {
    const entry = JSON.parse(raw)
    return entry.v === true
  } catch {
    return false
  }
}

/**
 * 切换页面的上锁/解锁显示状态
 */
function toggleLockState(): void {
  const locked = document.getElementById('locked-section')!
  const unlocked = document.getElementById('unlocked-section')!

  if (isPasswordUnlocked('E')) {
    locked.classList.add('hidden')
    unlocked.classList.remove('hidden')
  } else {
    locked.classList.remove('hidden')
    unlocked.classList.add('hidden')
  }
}

/* ============================================================
   渲染
   ============================================================ */

function renderThreads(): void {
  const tbody = document.getElementById('thread-list')!

  tbody.innerHTML = THREADS.map((t) => {
    const unlocked = isPasswordUnlocked(t.requiredPassword)
    const icon = unlocked ? '📄' : '🔒'
    const iconClass = unlocked ? '' : 'icon-locked'
    const rowClass = unlocked ? '' : 'thread-locked'

    return `<tr class="${rowClass}">
      <td class="td-status"><span class="${iconClass}">${icon}</span></td>
      <td class="td-title">
        <a class="thread-link clickable-highlight"
           data-id="${t.id}"
           data-route="${t.route}"
           data-pw-id="${t.requiredPassword}"
           data-pw-prompt="${t.passwordPrompt}"
           href="javascript:void(0)">${t.title}</a>
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
      const route = (el as HTMLElement).dataset.route!
      const pwId = (el as HTMLElement).dataset.pwId as PasswordId
      const pwPrompt = (el as HTMLElement).dataset.pwPrompt!

      const unlocked = isPasswordUnlocked(pwId)
      if (unlocked) {
        addPathLog(`盲区版块 → 点击帖子: ${(el as HTMLElement).textContent?.trim()}`)
        window.open(route, '_blank')
      } else {
        showPasswordOverlay(pwPrompt, pwId, route, () => {
          const stateKey = ('pw_' + pwId.toLowerCase()) as 'pw_e' | 'pw_f'
          unlock(stateKey)
          addPathLog(`盲区 → 密码${pwId}解锁`)
        })
      }
    })
  })
}

function renderPagination(): void {
  const container = document.getElementById('pagination')!
  container.innerHTML = '<span class="disabled">&laquo; 上一页</span>' +
    '<span class="page-current">1</span>' +
    '<span class="disabled">下一页 &raquo;</span>'
}

/* ============================================================
   密码弹窗
   ============================================================ */

function showPasswordOverlay(
  prompt: string,
  passwordId: PasswordId,
  route: string,
  onSuccess?: () => void,
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
      if (onSuccess) {
        onSuccess()
      } else {
        window.open(route, '_blank')
      }
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
      historyContainer.innerHTML = '<li style="color:#666;cursor:default;">暂无搜索记录</li>'
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
      resultContainer.innerHTML = '<span style="color:#666;">未找到相关结果</span>'
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
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入盲区版块')

  // 切换上锁/解锁状态
  toggleLockState()

  // 搜索
  initSearch()

  if (isPasswordUnlocked('E')) {
    // 已解锁 → 渲染帖子列表
    renderThreads()
    renderPagination()
  } else {
    // 未解锁 → 注册解锁按钮
    const unlockBtn = document.getElementById('unlock-btn')!
    unlockBtn.addEventListener('click', () => {
      showPasswordOverlay('请输入密钥以解锁盲区', 'E', '', () => {
        unlock('pw_e')
        addPathLog('盲区 → 密码E解锁')
        toggleLockState()
        renderThreads()
        renderPagination()
      })
    })
  }

  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
