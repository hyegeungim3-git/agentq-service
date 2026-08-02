/**
 * 관리자 대시보드가 다루는 것들 — 클러스터·서비스·GPU·학습 작업.
 *
 * ⚠️ **이 값들은 서버가 붙기 전까지 전부 예시다.** 다른 화면의 fixture는 업무 로직을
 * 보여 주지만(요약이 어떻게 나오는가), 인프라 수치는 로직이 없다. 숫자 자체가 전부다.
 * 그래서 지어낸 값을 실측처럼 그리면 **거짓 계기판**이 된다. 화면이 반드시
 * '서버 미연결 — 예시 값'을 먼저 말한다(SCOPE-PLAN §3-7).
 *
 * 상태는 코드로 받는다. `'Healthy'` 같은 표시 문자열이나 색은 서버가 주지 않는다.
 */

export type HealthLevel = 'ok' | 'warn' | 'down'

export const HEALTH_LABEL: Record<HealthLevel, string> = {
  ok: '정상',
  warn: '주의',
  down: '중단',
}

/** 클러스터 자원 — 비율은 0~1 */
export type ClusterResource = {
  cpuRatio: number
  memoryRatio: number
  filesystemRatio: number
  /** 평균 GPU 소비 전력(W) */
  gpuPowerWatt: number
}

export type NodeInfo = {
  name: string
  instance: string
  os: string
  kernel: string
  cpuRatio: number
  memoryRatio: number
}

export type PodPhase = 'Running' | 'Completed' | 'Pending' | 'Failed'

export type PodInfo = {
  name: string
  namespace: string
  /** 밀리코어 */
  cpuMilli: number
  /** 메비바이트 */
  memoryMib: number
  phase: PodPhase
  /** 재시작 횟수 — 0이 아니면 조용히 죽고 있다는 뜻이다 */
  restarts: number
}

/** 파드 집계 구간 */
export type PodWindow = '1h' | '6h' | '24h' | '7d'
export const POD_WINDOWS: PodWindow[] = ['1h', '6h', '24h', '7d']

export type ServiceStatus = {
  id: string
  name: string
  role: string
  level: HealthLevel
  uptimeHours: number
  /** 정상이 아니면 왜 그런지. 정상이면 null */
  reason: string | null
  /** 사람이 무엇을 해야 하는지. 조치가 필요 없으면 null */
  action: string | null
}

export type GpuCard = {
  index: number
  utilRatio: number
  vramRatio: number
  celsius: number
  watt: number
}

export type GpuNode = {
  name: string
  model: string
  /** 카드 1장의 VRAM(GB) */
  vramGb: number
  cards: GpuCard[]
}

/** 과부하 판정 기준 — 화면이 아니라 여기서 한 번만 정한다 */
export const GPU_OVERLOAD_UTIL = 0.9
export const GPU_HOT_CELSIUS = 75

export const isOverloaded = (c: GpuCard): boolean =>
  c.utilRatio >= GPU_OVERLOAD_UTIL || c.celsius >= GPU_HOT_CELSIUS

export function gpuSummary(nodes: GpuNode[]): {
  total: number
  avgUtil: number
  avgCelsius: number
  overloaded: number
} {
  const cards = nodes.flatMap((n) => n.cards)
  if (cards.length === 0) return { total: 0, avgUtil: 0, avgCelsius: 0, overloaded: 0 }
  const sum = (f: (c: GpuCard) => number) => cards.reduce((n, c) => n + f(c), 0)
  return {
    total: cards.length,
    avgUtil: sum((c) => c.utilRatio) / cards.length,
    avgCelsius: Math.round(sum((c) => c.celsius) / cards.length),
    overloaded: cards.filter(isOverloaded).length,
  }
}

export type TrainJobState = 'running' | 'done' | 'failed' | 'queued'

export const TRAIN_STATE_LABEL: Record<TrainJobState, string> = {
  running: '학습 중',
  done: '학습 완료',
  failed: '실패',
  queued: '대기',
}

export type TrainJob = {
  id: string
  model: string
  kind: string
  startedAt: string
  state: TrainJobState
  /** 실패한 작업은 왜 실패했는지 말해야 한다 — 건수만 세면 손쓸 수 없다 */
  note: string | null
}

/** 자원 배분 — 합이 1이 되지 않을 수 있다. 남는 몫이 곧 여유다 */
export type Allocation = {
  label: string
  ratio: number
}

/** 학습 집계 구간 */
export type TrainWindow = 'day' | 'week' | 'month'
export const TRAIN_WINDOWS: TrainWindow[] = ['day', 'week', 'month']
export const TRAIN_WINDOW_LABEL: Record<TrainWindow, string> = {
  day: '일간',
  week: '주간',
  month: '월간',
}

export type TrainerReport = {
  window: TrainWindow
  done: number
  failed: number
  queued: number
  allocations: Allocation[]
  jobs: TrainJob[]
}

export const allocatedRatio = (a: Allocation[]): number => a.reduce((n, x) => n + x.ratio, 0)
