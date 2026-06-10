/**
 * 深空版块 (Deep Space Board) - 页面 ①
 * 夜航论坛 · 都市传说区
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

const THREADS: ThreadData[] = [
  // ---- 置顶 ----
  { id: 'sticky-1', title: '深空版块版规（2014 年修订）', author: '霄汉', replies: 3, views: 2890, lastAuthor: '霄汉', lastTime: '2014-03-02', sticky: true },
  { id: 'sticky-2', title: '【索引】深空精华帖汇总', author: 'Vega', replies: 12, views: 4521, lastAuthor: 'Vega', lastTime: '2016-08-15', sticky: true },

  // ---- 可点击（解谜链关键帖） ----
  { id: 'exploration', title: '阳光新城旁废弃危房区探险', author: '探险者', replies: 23, views: 1856, lastAuthor: '隼', lastTime: '2016-03-14', clickable: true, route: '/post/exploration', hot: true },

  // ---- 普通帖子 ----
  { id: 'bus-13', title: '凌晨 3 点的 13 路公交车——我一个朋友的亲身经历', author: '匿名', replies: 15, views: 1234, lastAuthor: '夜行客', lastTime: randomDate(), hot: true },
  { id: 'crying-building', title: '老城区拆迁楼里的哭声，有谁听过？', author: '风居住的街道', replies: 8, views: 876, lastAuthor: '阿星', lastTime: randomDate() },
  { id: 'school-well', title: '学校后山那口被封掉的井', author: '毕业生甲', replies: 42, views: 3201, lastAuthor: 'OldZhang', lastTime: randomDate(), hot: true },
  { id: 'mirror-move', title: '我家的镜子会自己移动——已持续三个月', author: '失眠者', replies: 31, views: 2100, lastAuthor: '猫眼', lastTime: randomDate(), hot: true },
  { id: 'air-raid-siren', title: '有人在深夜听到防空警报吗？坐标北郊', author: '夜猫子', replies: 7, views: 543, lastAuthor: '雷达', lastTime: randomDate() },
  { id: 'hospital-night', title: '医院太平间的值班记录（慎入）', author: '医生不姓白', replies: 56, views: 4890, lastAuthor: '小护士', lastTime: randomDate(), hot: true },
  { id: 'elevator-game', title: '试过电梯游戏吗？说几个我遇到的怪事', author: '按钮狂魔', replies: 19, views: 1567, lastAuthor: '电梯工', lastTime: randomDate() },
  { id: 'radio-static', title: '旧收音机能收到一个没人说话的电波', author: '听风者', replies: 11, views: 923, lastAuthor: '电磁波', lastTime: randomDate() },
  { id: 'abandoned-asylum', title: '市郊精神病院的废墟探险记录', author: '探险者', replies: 28, views: 2345, lastAuthor: '隼', lastTime: randomDate(), hot: true },
  { id: 'neighbor-upstairs', title: '楼上住户从未出过门——已两年', author: '楼下住户', replies: 67, views: 5678, lastAuthor: '侦探小王', lastTime: randomDate(), hot: true },
  { id: 'lake-drowning', title: '人工湖每年淹死一个人，今年刚好第十年', author: '钓鱼佬', replies: 14, views: 1100, lastAuthor: '水文站', lastTime: randomDate() },
  { id: 'phone-call-dead', title: '去世三年的奶奶昨晚给我打了电话', author: '孙某人', replies: 45, views: 3987, lastAuthor: '通灵者', lastTime: randomDate(), hot: true },
  { id: 'tunnel-light', title: '隧道里的那盏灯——每次经过都感觉有人在看我', author: '老司机', replies: 9, views: 765, lastAuthor: '副驾驶', lastTime: randomDate() },
  { id: 'library-book', title: '图书馆里一本从没有人借过的书', author: '书虫', replies: 22, views: 1876, lastAuthor: '管理员', lastTime: randomDate() },
  { id: 'old-photo', title: '在老房子阁楼发现一张 1987 年的照片——里面的人我不认识', author: '阁楼探险家', replies: 33, views: 2765, lastAuthor: '老照片', lastTime: randomDate(), hot: true },
  { id: 'subway-platform', title: '末班地铁的空车厢里有人在下棋', author: '夜归人', replies: 6, views: 432, lastAuthor: '站务员', lastTime: randomDate() },
  { id: 'cctv-glitch', title: '小区监控拍到的东西——物业说硬盘坏了', author: '保安老李', replies: 18, views: 1543, lastAuthor: '技术宅', lastTime: randomDate() },
  { id: 'children-song', title: '半夜楼下有人放童谣——但那里是空地', author: '被吵醒的人', replies: 25, views: 2100, lastAuthor: '失眠者', lastTime: randomDate(), hot: true },
  { id: 'disappeared-house', title: '我记得那栋楼是红色的——但所有人说是白色', author: '记忆偏差', replies: 13, views: 987, lastAuthor: '心理学爱好者', lastTime: randomDate() },
  { id: 'well-water', title: '老家井水一夜之间变红了', author: '乡下人', replies: 21, views: 1654, lastAuthor: '地质学家', lastTime: randomDate() },
  { id: 'mirror-man', title: '传说在镜子里看见自己背后有人——我看见了', author: '胆小鬼', replies: 37, views: 3245, lastAuthor: '镜子测试', lastTime: randomDate(), hot: true },
  { id: 'funeral-procession', title: '凌晨四点的送葬队伍——但那天没人去世', author: '早起的虫', replies: 10, views: 876, lastAuthor: '守夜人', lastTime: randomDate() },
  { id: 'attic-footsteps', title: '阁楼的脚步声——但上面没人住', author: '阁楼恐惧症', replies: 16, views: 1232, lastAuthor: '房东', lastTime: randomDate() },
  { id: 'park-statue', title: '公园那尊雕像的眼睛会转动——我发誓是真的', author: '遛狗人', replies: 29, views: 2456, lastAuthor: '雕塑家', lastTime: randomDate(), hot: true },
  { id: 'digital-clock', title: '微波炉上的时间总是回到 00:00——但没断电', author: '厨房怪谈', replies: 5, views: 432, lastAuthor: '电工', lastTime: randomDate() },
  { id: 'lost-hiker', title: '雾灵山失踪的徒步者——搜救队说找到了不属于他的背包', author: '登山者', replies: 48, views: 4567, lastAuthor: '护林员', lastTime: randomDate(), hot: true },
  { id: 'raincoat-man', title: '下雨天总站在路口穿黄色雨衣的人', author: '带伞的人', replies: 11, views: 987, lastAuthor: '气象员', lastTime: randomDate() },
  { id: 'doll-collection', title: '邻居家收藏了满屋子的娃娃——全是 vintage', author: '好奇宝宝', replies: 20, views: 1765, lastAuthor: '古董商', lastTime: randomDate() },
  { id: 'bridge-jumper', title: '同一条河同一座桥——五年来每月有人跳', author: '河边的卡夫卡', replies: 39, views: 3456, lastAuthor: '社会新闻', lastTime: randomDate(), hot: true },
  { id: 'basement-door', title: '公司地下室的铁门——钥匙在 HR 手里但没人记得为什么锁', author: '打工仔', replies: 17, views: 1345, lastAuthor: '前员工', lastTime: randomDate() },
  { id: 'graveyard-shift', title: '值夜班时保安室的对讲机传来呼吸声', author: '夜班保安', replies: 12, views: 1023, lastAuthor: '巡逻员', lastTime: randomDate() },
  { id: 'foggy-morning', title: '雾天在桥上看到一个穿旗袍的女人——然后她消失了', author: '早起跑步的人', replies: 24, views: 2134, lastAuthor: '晨练大爷', lastTime: randomDate(), hot: true },
  { id: 'vintage-watch', title: '从旧货市场买的手表——时间永远停在 3:17', author: '旧货爱好者', replies: 8, views: 654, lastAuthor: '修表匠', lastTime: randomDate() },
  { id: 'cat-behavior', title: '我家猫总对着同一面墙哈气', author: '猫奴', replies: 34, views: 2987, lastAuthor: '兽医', lastTime: randomDate(), hot: true },
  { id: 'music-box', title: '女朋友送我的八音盒——打开不是我们定的曲子', author: '恋爱中', replies: 9, views: 765, lastAuthor: '音乐生', lastTime: randomDate() },
  { id: 'abandoned-car', title: '村口那辆报废的面包车——里面有人生活的痕迹', author: '村民甲', replies: 15, views: 1234, lastAuthor: '村支书', lastTime: randomDate() },
  { id: 'elevator-floor-4', title: '电梯总是在 4 楼停一下——但 4 楼没人按', author: '高层住户', replies: 27, views: 2345, lastAuthor: '电梯维修工', lastTime: randomDate(), hot: true },
  { id: 'photo-negative', title: '洗出来的照片里多了一个人', author: '摄影爱好者', replies: 41, views: 3678, lastAuthor: '照相馆老板', lastTime: randomDate(), hot: true },
  { id: 'swing-set', title: '凌晨的秋千自己在动', author: '夜跑者', replies: 13, views: 1098, lastAuthor: '园艺师', lastTime: randomDate() },
  { id: 'sewer-noise', title: '下水道井盖下有敲击声——但下面是死路', author: '市政工人', replies: 19, views: 1567, lastAuthor: '工程师', lastTime: randomDate() },
]

/* ============================================================
   渲染
   ============================================================ */

function renderThreads(): void {
  const tbody = document.getElementById('thread-list')!
  const visited = getVisitedSet()

  tbody.innerHTML = THREADS.map((t) => {
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
  addPathLog('进入深空版块（都市传说区）')

  // Render threads
  renderThreads()

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
