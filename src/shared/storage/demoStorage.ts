/**
 * 브라우저 저장 경계.
 *
 * 이전 데모는 localStorage를 화면 곳곳에서 직접 불렀다. 서버가 붙으면 호출부를
 * 전부 찾아야 하고, '저장하면 안 되는 데이터'를 막을 지점도 없었다.
 * 여기 한 곳으로 모아 두면 교체도 정책 적용도 이 파일에서만 하면 된다.
 *
 * `sensitive: true`는 **쓰기를 거부**한다. 보안 세션의 무저장 약속을 주석이 아니라
 * 코드로 강제하기 위한 것이다 — 실수로 저장하는 경로가 생기지 않는다.
 *
 * 설계 출처: 이전 저장소의 `src/core/demoStorage.js`. 좋은 아이디어라 가져오되
 * 타입을 얹고 스키마 버전 불일치 처리를 명시했다.
 */

export const STORAGE_NAMESPACE = 'agentq'
export const STORAGE_SCHEMA_VERSION = 1

export type StorageOptions = {
  /** 보안 세션 데이터 — 읽기는 fallback, 쓰기는 거부한다 */
  sensitive?: boolean
}

export const globalKey = (feature: string): string => `${STORAGE_NAMESPACE}.${feature}`
export const domainKey = (feature: string, domainId: string): string =>
  `${globalKey(feature)}.${domainId}`

type Envelope<T> = { v: number; data: T }

function getStore(): Storage | null {
  try {
    return globalThis.localStorage
  } catch {
    // 프라이빗 모드·SSR 등에서 접근 자체가 던진다
    return null
  }
}

/** 저장된 값을 읽는다. 없거나 깨졌거나 스키마 버전이 다르면 fallback. */
export function readJson<T>(key: string, fallback: T, opts: StorageOptions = {}): T {
  if (opts.sensitive) return fallback
  try {
    const raw = getStore()?.getItem(key)
    if (raw == null) return fallback
    const parsed = JSON.parse(raw) as Envelope<T> | T
    // 봉투가 없으면 구버전 데이터 — 버리고 fallback을 쓴다(조용히 깨진 값을 쓰지 않는다)
    if (typeof parsed !== 'object' || parsed === null || !('v' in parsed)) return fallback
    if (parsed.v !== STORAGE_SCHEMA_VERSION) return fallback
    return parsed.data
  } catch {
    return fallback
  }
}

/** 저장한다. sensitive면 쓰지 않고 false를 돌려준다. */
export function writeJson<T>(key: string, data: T, opts: StorageOptions = {}): boolean {
  if (opts.sensitive) return false
  try {
    const store = getStore()
    if (!store) return false
    const env: Envelope<T> = { v: STORAGE_SCHEMA_VERSION, data }
    store.setItem(key, JSON.stringify(env))
    return true
  } catch {
    // 용량 초과·권한 거부 — 데모 흐름을 막지 않는다
    return false
  }
}

export function remove(key: string): void {
  try {
    getStore()?.removeItem(key)
  } catch {
    /* 무시 */
  }
}

/** 이 앱이 쓴 키만 지운다 — 다른 앱의 저장값을 건드리지 않는다. */
export function clearAll(): void {
  try {
    const store = getStore()
    if (!store) return
    Object.keys(store)
      .filter((k) => k.startsWith(`${STORAGE_NAMESPACE}.`))
      .forEach((k) => store.removeItem(k))
  } catch {
    /* 무시 */
  }
}
