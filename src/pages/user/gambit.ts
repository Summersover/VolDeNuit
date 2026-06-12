/**
 * Gambit 用户主页 — 页面⑮
 * 夜航论坛 · 用户中心
 *
 * 密码C（19930629）解锁后展示：
 * - 空白主页，右上角"档案"按钮 → /user/gambit/archive
 *
 * 与解谜链对齐：本页面为序号 ⑮，右下角显示 15/30
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory, isUnlocked, unlock } from '../../shared/state'
import { search as doSearch, getSearchHistory } from '../../shared/search'
import type { SearchResult } from '../../shared/types'
import { checkAccess } from '../../shared/guard'

const PASSWORD_C = '19930629'

/* ============================================================
   密码校验
   ============================================================ */

function normalizePw(val: string): string {
  return val.replace(/\s+/g, '').toLowerCase()
}

function verifyPassword(input: string): boolean {
  return normalizePw(input) === normalizePw(PASSWORD_C)
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
   锁屏 / 解锁
   ============================================================ */

function initLockScreen(): void {
  const lockScreen = document.getElementById('lock-screen')!
  const profileContent = document.getElementById('profile-content')!
  const pwInput = document.getElementById('lock-password') as HTMLInputElement
  const submitBtn = document.getElementById('lock-submit') as HTMLButtonElement
  const errorEl = document.getElementById('lock-error')!

  function showContent(): void {
    lockScreen.classList.add('lock-hidden')
    profileContent.classList.remove('content-hidden')
    addPathLog('密码C正确 → Gambit主页内容解锁')
  }

  if (localStorage.getItem('nf_unlock_gambit') === '1') {
    showContent()
    return
  }

  pwInput.focus()

  function attemptUnlock(): void {
    const val = pwInput.value.trim()
    if (verifyPassword(val)) {
      localStorage.setItem('nf_unlock_gambit', '1')
      addPathLog('密码C验证成功 → 解锁用户主页')
      errorEl.classList.add('hidden')
      showContent()
    } else {
      errorEl.classList.remove('hidden')
      pwInput.classList.add('shake')
      setTimeout(() => pwInput.classList.remove('shake'), 300)
      pwInput.value = ''
      pwInput.focus()
    }
  }

  submitBtn.addEventListener('click', attemptUnlock)

  pwInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptUnlock()
  })
}

/* ============================================================
   档案链接
   ============================================================ */

function initArchiveLink(): void {
  const link = document.getElementById('archive-link')!
  link.addEventListener('click', (e) => {
    e.preventDefault()
    addPathLog('Gambit主页 → 点击档案')
    window.open('/user/gambit/archive', '_blank')
  })
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入Gambit主页（页面⑮）')

  initLockScreen()
  initSearch()
  initArchiveLink()
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
