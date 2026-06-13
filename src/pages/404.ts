/**
 * 404 页面 — 全局交互彩蛋
 *
 * 任意不存在路径显示该页面。中央淡色"确定"按钮可点击，
 * 5 次点击依次切换文字，第 5 次后自动重定向至深空版块。
 *
 * 文字序列：
 * ① "你点了。然后呢？"
 * ② "也许你找的东西不在这里。"
 * ③ "——但它确实存在。"
 * ④ "问题是你找对地方了吗？"
 * ⑤ "晚安，飞行员。" → 重定向
 */

const LINES = [
  '你点了。然后呢？',
  '也许你找的东西不在这里。',
  '——但它确实存在。',
  '问题是你找对地方了吗？',
  '晚安，飞行员。',
]

let clickCount = 0
const MAX_CLICKS = LINES.length

function init(): void {
  const btn = document.getElementById('confirm-btn')!
  const subMsg = document.getElementById('sub-msg')!

  btn.addEventListener('click', () => {
    if (clickCount >= MAX_CLICKS) return

    // 显示对应文案
    subMsg.textContent = LINES[clickCount]
    subMsg.className = 'visible'

    // 按钮颜色逐次加深
    const classes = ['clicked-once', 'clicked-twice', 'clicked-thrice', 'clicked-four', 'clicked-final']
    if (clickCount < classes.length) {
      btn.classList.add(classes[clickCount])
    }

    clickCount++

    // 第 5 次点击后延迟重定向
    if (clickCount === MAX_CLICKS) {
      btn.textContent = '…'
      setTimeout(() => {
        window.location.href = '/board/deepspace'
      }, 1500)
    }
  })
}

document.addEventListener('DOMContentLoaded', init)
