/**
 * 波利比奥斯加解密工具 — 页面㉒
 * 独立外部工具页，无论坛UI。
 * 输入字母→加密→得到数字，输入数字→解密→得到字母。
 * 用于将密码A转为密码F。
 */

/* ---- 波利比奥斯方阵 ---- */
const ROWS = 5
const COLS = 5

/** 5×5 方阵（I/J 合并） */
const GRID: string[][] = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'K'],
  ['L', 'M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
]

/** 字母 → 坐标映射 */
const CHAR_MAP: Record<string, string> = {}
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const ch = GRID[r][c]
    const code = `${r + 1}${c + 1}`
    CHAR_MAP[ch] = code
    // I/J share the same cell
    if (ch === 'I') CHAR_MAP['J'] = code
  }
}

/** 坐标 → 字母映射 */
const CODE_MAP: Record<string, string> = {}
for (const [ch, code] of Object.entries(CHAR_MAP)) {
  // I takes precedence for the shared cell
  if (!CODE_MAP[code] || ch === 'I') {
    CODE_MAP[code] = ch
  }
}

/* ---- 算法 ---- */

/** 加密：字母 → 数字 */
function encrypt(text: string): string {
  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '')
  const pairs: string[] = []
  for (const ch of cleaned) {
    if (ch === 'J') {
      // J → same as I
      pairs.push(CHAR_MAP['I'])
    } else if (CHAR_MAP[ch]) {
      pairs.push(CHAR_MAP[ch])
    }
  }
  return pairs.join(' ')
}

/** 解密：数字 → 字母 */
function decrypt(text: string): string {
  const digits = text.replace(/\s+/g, '')
  const letters: string[] = []
  for (let i = 0; i < digits.length - 1; i += 2) {
    const code = digits.substring(i, i + 2)
    if (CODE_MAP[code]) {
      letters.push(CODE_MAP[code])
    }
  }
  return letters.join('')
}

/* ---- 交互 ---- */

function init(): void {
  const inputEl = document.getElementById('input-text') as HTMLTextAreaElement
  const outputEl = document.getElementById('output-text') as HTMLTextAreaElement
  const encBtn = document.getElementById('btn-encrypt') as HTMLButtonElement
  const decBtn = document.getElementById('btn-decrypt') as HTMLButtonElement

  // 加密
  encBtn.addEventListener('click', () => {
    const raw = inputEl.value
    if (!raw.trim()) return
    outputEl.value = encrypt(raw)
  })

  // 解密
  decBtn.addEventListener('click', () => {
    const raw = outputEl.value
    if (!raw.trim()) return
    inputEl.value = decrypt(raw)
  })

  // Enter 快捷键（在输入框中按 Ctrl+Enter 触发对应操作）
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      encBtn.click()
    }
  })

  outputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      decBtn.click()
    }
  })
}

document.addEventListener('DOMContentLoaded', init)
