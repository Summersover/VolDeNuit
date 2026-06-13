/**
 * beacon_holder 用户主页 — 页面⑭
 * 夜航论坛 · 用户中心
 *
 * 密码C（19930629）解锁后展示：
 * - Δ 头像
 * - 邮箱前半段 sbire（后半段数据丢失）
 * - 踩点帖链接 → /post/scouting-2014（extra3）
 * - 底部隐藏按钮 → 弹窗"真相在盲区"
 *
 * 与解谜链对齐：本页面为序号 ⑭，右下角显示 14/30
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory, isUnlocked, unlock, setState } from '../../shared/state'
import { search as doSearch, getSearchHistory } from '../../shared/search'
import type { SearchResult } from '../../shared/types'
import { checkAccess } from '../../shared/guard'

/* ============================================================
   密码C = 19930629（站长生日：1993年6月29日，圣埃克苏佩里诞辰）
   ============================================================ */
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
    setState('bh_visited', true)
    addPathLog('密码C正确 → beacon_holder主页内容解锁')
  }

  // 如果已经在本页解锁过，直接显示内容
  if (localStorage.getItem('nf_unlock_beacon') === '1') {
    showContent()
    return
  }

  // 未解锁：锁屏可见，绑定输入
  pwInput.focus()

  function attemptUnlock(): void {
    const val = pwInput.value.trim()
    if (verifyPassword(val)) {
      localStorage.setItem('nf_unlock_beacon', '1')
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
   隐藏底部按钮 → 弹窗
   ============================================================ */

function initHiddenTrigger(): void {
  const trigger = document.getElementById('hidden-trigger')!
  const modal = document.getElementById('secret-modal')!
  const closeBtn = document.getElementById('secret-close')!

  trigger.addEventListener('click', () => {
    modal.classList.remove('hidden')
    addPathLog('beacon_holder主页 → 触发隐藏弹窗')
  })

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden')
  })

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden')
    }
  })
}

/* ============================================================
   踩点帖链接
   ============================================================ */

function initThreadLink(): void {
  const scoutingLink = document.getElementById('scouting-link')!
  scoutingLink.addEventListener('click', (e) => {
    e.preventDefault()
    addPathLog('beacon_holder主页 → 点击踩点帖')
    window.open('/post/scouting-2014', '_blank')
  })
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  addPathLog('进入beacon_holder主页（页面⑭）')

  // 守卫检查
  const { allowed } = checkAccess(window.location.pathname)
  if (!allowed) {
    // 密码C未解锁 → 锁屏界面处理（initLockScreen 内处理）
    // 但允许页面在锁屏状态下加载，由用户输入密码
  }

  initLockScreen()
  initSearch()
  initHiddenTrigger()
  initThreadLink()
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
