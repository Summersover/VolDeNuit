import type { PasswordId } from './types'

/**
 * 预计算的 SHA-256 哈希值（十六进制 64 字符）
 * 源码中不出现任何密码明文
 */
const PASSWORD_HASHES: Record<PasswordId, string> = {
  A: '5d2e399f6cd4ca21ecb727cd74b14a74bcc42e688aaf39b3449af089180b0727', // "Vol de Nuit"
  B: '4c6f6b6d6cbc7e78a1ffec07978e50234a7209eaa36b209e6e34c2fa5849c2bf', // "道路一旦开辟，就不能不去追寻。"
  C: '90ce96c1048ff254e703c7fac444af26ba49bacc276b5e8c23b619681bb1900e', // 19930629（站长1993年6月29日生）
  D: 'a8b98aee4f538c20a90694235c853a347f05627cf917115c6ea01de1216dea4b', // sbire@zhengye.com.cn
  E: '374013a250377c86e6ec3543fa896ac4b621fc115aa49dbb4346ae4fc10f6ea2', // 20160924（隼被杀日期）
  F: 'a73d2f1eb05016f305f22794f540ec6db39bb288e1743889a64490b80805a379', // 513431141533452444（密码A经波利比奥斯5×5加密）
}

/**
 * 验证密码：输入值 → SHA-256 → 与预存哈希比对
 * 不区分大小写（输入时已统一处理）
 */
export async function checkPassword(id: PasswordId, input: string): Promise<boolean> {
  const expected = PASSWORD_HASHES[id]
  if (!expected) throw new Error(`密码 ${id} 的哈希尚未配置`)

  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  const hex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return hex === expected
}

/**
 * 判断某密码是否已配置哈希值
 */
export function isHashConfigured(id: PasswordId): boolean {
  return PASSWORD_HASHES[id].length === 64
}
