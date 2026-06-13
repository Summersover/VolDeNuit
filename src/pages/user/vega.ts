/**
 * Vega 用户主页 — 页面⑲
 * 夜航论坛 · 用户中心
 *
 * 双密码解锁：
 * - 密码C（19930629）→ 显示已注销的空白主页
 * - 密码B（道路一旦开辟，就不能不去追寻。）→ 解锁隐藏的个人简介
 *
 * 与解谜链对齐：本页面为序号 ⑲，右下角显示 19/30
 */

import '../../shared/state'
import { addPathLog, addSearchHistory, removeSearchHistory, isUnlocked, unlock, getState } from '../../shared/state'
import { search as doSearch, getSearchHistory } from '../../shared/search'
import type { SearchResult } from '../../shared/types'
import { checkAccess } from '../../shared/guard'

/* ============================================================
   密码
   ============================================================ */

const PASSWORD_C = '19930629'

const PASSWORD_B = '道路一旦开辟，就不能不去追寻。'

function normalizePw(val: string): string {
  return val.replace(/[\s，。！？、；：""''【】「」『』《》（）·…—\-.,;:!?()\[\]{}'"\/\\_@#$%^&*+=<>`~|·]/g, '').toLowerCase()
}

function matchPw(input: string, target: string): boolean {
  return normalizePw(input) === normalizePw(target)
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
    addPathLog('密码正确 → Vega主页解锁')
  }

  // 如果已在本页解锁过，直接显示内容
  if (localStorage.getItem('nf_unlock_vega') === '1') {
    showContent()
    return
  }

  pwInput.focus()

  function attemptUnlock(): void {
    const val = pwInput.value.trim()
    if (matchPw(val, PASSWORD_C)) {
      localStorage.setItem('nf_unlock_vega', '1')
      addPathLog('密码C验证成功 → 解锁Vega主页')
      errorEl.classList.add('hidden')
      showContent()
    } else if (matchPw(val, PASSWORD_B)) {
      localStorage.setItem('nf_unlock_vega', '1')
      localStorage.setItem('nf_unlock_vega_bio', '1')
      addPathLog('密码B验证成功 → 解锁Vega主页')
      errorEl.classList.add('hidden')
      showContent()
      // 密码B同时解锁个人简介
      revealBio()
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
   个人简介解锁（密码B）
   ============================================================ */

function revealBio(): void {
  const bioLocked = document.getElementById('bio-locked')!
  const bioContent = document.getElementById('bio-content')!
  const bioStatus = document.getElementById('bio-status')!

  bioLocked.classList.add('hidden')
  bioContent.classList.remove('hidden')
  if (bioStatus) bioStatus.textContent = '已解锁'
  addPathLog('密码B正确 → Vega个人简介解锁')
}

function initBioUnlock(): void {
  const pwInput = document.getElementById('bio-password') as HTMLInputElement
  const submitBtn = document.getElementById('bio-submit') as HTMLButtonElement
  const errorEl = document.getElementById('bio-error')!

  // 如果已在本页解锁过个人简介，直接显示
  if (localStorage.getItem('nf_unlock_vega_bio') === '1') {
    revealBio()
    return
  }

  function attemptUnlock(): void {
    const val = pwInput.value.trim()
    if (matchPw(val, PASSWORD_B)) {
      localStorage.setItem('nf_unlock_vega_bio', '1')
      errorEl.classList.add('hidden')
      revealBio()
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
   私信草稿入口
   ============================================================ */

function initDraftsLink(): void {
  const link = document.getElementById('drafts-link')!
  link.addEventListener('click', (e) => {
    e.preventDefault()
    addPathLog('Vega主页 → 点击私信箱')
    window.open('/user/vega/drafts', '_blank')
  })
}

/* ============================================================
   初始化
   ============================================================ */

function init(): void {
  // 检查访问权限：需先解锁beacon_holder主页
  const { allowed } = checkAccess(window.location.pathname)
  if (!allowed) {
    addPathLog('Vega主页 → 访问被拒（未查看beacon_holder）')
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0A1628;color:#4A6A7A;font-size:14px;">页面未找到</div>'
    return
  }

  addPathLog('进入Vega主页（页面⑲）')

  initLockScreen()
  initSearch()
  initBioUnlock()
  initDraftsLink()
  window.scrollTo(0, 0)
}

document.addEventListener('DOMContentLoaded', init)
