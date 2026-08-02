/**
 * 업무 신호 — 지금 처리해야 할 일이 생겼다는 알림.
 *
 * 공지(`entities/notice`)와 다르다. 공지는 사람이 써서 모두에게 알리는 글이고,
 * 신호는 시스템이 감지한 사건이다. 둘을 한 곳에 섞으면 '읽으면 끝나는 것'과
 * '처리해야 끝나는 것'이 구분되지 않는다.
 *
 * 같은 데이터를 두 곳에서 쓴다 — 알림 센터(목록)와 오늘의 업무 브리핑(카드).
 * 따로 두면 한쪽만 고쳐져 서로 다른 말을 하게 된다.
 */
import type { AgentId } from '@entities/agent/model'

export type SignalSeverity = 'action' | 'watch' | 'info'

/** 이 신호를 처리할 화면 — 없으면 안내만 하고 끝난다 */
export type SignalLink =
  | { kind: 'agent'; agentId: AgentId; label: string }
  | { kind: 'scenario'; label: string }
  | null

export type WorkSignal = {
  id: string
  /** 'MM-DD HH:mm' 로 표시할 원시 시각 (ISO) */
  at: string
  title: string
  detail: string
  severity: SignalSeverity
  /** 무엇이 이 신호를 만들었는지 — 근거 없는 알림은 확인할 방법이 없다 */
  source: string
  link: SignalLink
}

const SEVERITY_LABEL: Record<SignalSeverity, string> = {
  action: '처리 필요',
  watch: '지켜볼 것',
  info: '참고',
}

export const signalSeverityLabel = (s: SignalSeverity): string => SEVERITY_LABEL[s]

/** 처리해야 하는 것만 — 브리핑은 이것부터 보여 준다 */
export function actionable(signals: WorkSignal[]): WorkSignal[] {
  return signals.filter((s) => s.severity === 'action')
}

/** 'MM-DD HH:mm' — 표시 변환은 한 곳에서만 한다 */
export function formatSignalTime(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
