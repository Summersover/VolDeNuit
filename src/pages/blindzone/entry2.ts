/**
 * 盲区存档Ⅱ — 页面㉓
 * 夜航论坛 · 盲区
 *
 * 密码F解锁后可见。
 * 进入时先弹窗公布霄汉死讯。
 * "弃子"可点击 → extra6 (Gambit完整陈述)
 *
 * 与解谜链对齐：本页面为序号 ㉓，右下角显示 23/30
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
      addPathLog('盲区存档Ⅱ — 访问被拒绝（密码F未解锁）')
    }
    return false
  }
  return true
}

/* ============================================================
   死讯弹窗
   ============================================================ */

function initDeathModal(): Promise<void> {
  return new Promise((resolve) => {
    const modal = document.getElementById('death-modal')!
    const acknowledgeBtn = document.getElementById('death-acknowledge')!

    // 弹窗强制显示
    modal.classList.remove('death-modal-hidden')
    modal.classList.add('death-modal-visible')

    addPathLog('盲区存档Ⅱ → 显示霄汉死讯')

    acknowledgeBtn.addEventListener('click', () => {
      modal.classList.remove('death-modal-visible')
      modal.classList.add('death-modal-hidden')
      addPathLog('盲区存档Ⅱ → 确认霄汉死讯')
      resolve()
    })
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
   弃子 → extra6
   ============================================================ */

function initPawnLink(): void {
  const link = document.getElementById('pawn-link')!
  link.addEventListener('click', (e) => {
    e.preventDefault()
    addPathLog('盲区存档Ⅱ → 弃子（Gambit完整陈述）')
    window.open('/statement/', '_blank')
  })
}

/* ============================================================
   初始化
   ============================================================ */

async function init(): Promise<void> {
  addPathLog('进入盲区存档Ⅱ（页面㉓）')

  const allowed = initGuard()

  initSearch()

  if (allowed) {
    await initDeathModal()
    initPawnLink()
  }

  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
