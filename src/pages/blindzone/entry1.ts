/**
 * 盲区存档Ⅰ — 页面⑳
 * 夜航论坛 · 盲区
 *
 * 霄汉的第一份日志。密码E解锁后可见。
 * 底部折叠消息 → 密码F线索 + extra5入口。
 *
 * 与解谜链对齐：本页面为序号 ⑳，右下角显示 20/30
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory } from '../../shared/state'
import { search as doSearch, getSearchHistory } from '../../shared/search'
import type { SearchResult } from '../../shared/types'
import { checkAccess } from '../../shared/guard'

/* ============================================================
   页面守卫
   ============================================================ */

function initGuard(): boolean {
  const result = checkAccess(window.location.pathname)
  if (!result.allowed) {
    const denied = document.getElementById('access-denied')!
    const content = document.getElementById('log-content')!
    denied.classList.remove('hidden')
    content.classList.add('hidden')

    if (result.action === 'redirect-blindzone') {
      // 显示拒绝信息，不自动跳转（让玩家有返回的路径）
      addPathLog('盲区存档Ⅰ — 访问被拒绝（密码E未解锁）')
    }
    return false
  }
  return true
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
   隐藏触发 + 弹窗（仿 beacon_holder 主页）
   ============================================================ */

function initHiddenTrigger(): void {
  const trigger = document.getElementById('hidden-trigger')!
  const modal = document.getElementById('secret-modal')!
  const bg = document.getElementById('secret-modal-bg')!
  const closeBtn = document.getElementById('secret-close')!
  const link = document.getElementById('flight-path-link')!

  trigger.addEventListener('click', () => {
    modal.classList.remove('hidden')
    addPathLog('盲区存档Ⅰ → 点击隐藏触发点')
  })

  function closeModal(): void {
    modal.classList.add('hidden')
  }

  bg.addEventListener('click', closeModal)
  closeBtn.addEventListener('click', closeModal)

  link.addEventListener('click', (e) => {
    e.preventDefault()
    addPathLog('盲区存档Ⅰ → 希望我们不会像他一样遗憾（航线图）')
    window.open('/flight-path/', '_blank')
  })
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入盲区存档Ⅰ（页面⑳）')

  const allowed = initGuard()

  initSearch()

  if (allowed) {
    initHiddenTrigger()
  }

  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
