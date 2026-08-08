/**
 * 예측 모델 운영 — 배포한 뒤의 이야기.
 *
 * 학습·평가 화면이 '어떻게 만들었나'라면, 여기는 **'만든 것이 지금도 맞나'** 다.
 * 모델은 배포한 순간부터 낡기 시작한다. 들어오는 데이터가 달라지기 때문이다.
 *
 * ⚠️ **지표 방향이 모델마다 다르다.** MAE는 낮을수록 좋고 F1은 높을수록 좋다.
 * 두 수를 한 표에 나란히 세우면 반드시 잘못 읽는다 — 이전 데모는 '지표 특성이 달라
 * 해석에 주의'라고 적어 두는 데서 그쳤다. 주의하라고 적는 대신 **여유(margin)로
 * 바꿔서** 방향을 없앤다. 여유는 어느 모델이든 '남은 만큼'이고, 0에 가까울수록 급하다.
 */

/** 지표가 큰 쪽이 좋은가, 작은 쪽이 좋은가 */
export type MetricDirection = 'higher' | 'lower'

export type PredModel = {
  id: string
  name: string
  task: string
  version: string
  deployedOn: string
  metricName: string
  direction: MetricDirection
  /** 배포 시점 값 */
  baseline: number
  current: number
  /** 이 값을 넘으면(방향에 따라) 손봐야 한다 */
  threshold: number
  samples: string
  owner: string
  /** 다음 재학습 예정. 아직 안 정했으면 null */
  nextRetrainOn: string | null
}

/**
 * 임계까지 남은 여유를 **0~1로** 돌려준다.
 *
 * 방향을 여기서 흡수하므로 화면은 어느 모델이든 같은 방식으로 그린다.
 * 0이면 임계에 닿았고, 음수면 이미 넘었다.
 */
export function margin(m: PredModel): number {
  const span = Math.abs(m.threshold - m.baseline)
  if (span === 0) return 0
  const left = m.direction === 'higher' ? m.current - m.threshold : m.threshold - m.current
  return left / span
}

/** 임계를 넘었거나 여유가 이만큼도 안 남은 것 */
export const MARGIN_WARN = 0.25

export const needsAttention = (list: PredModel[]): PredModel[] =>
  list.filter((m) => margin(m) < MARGIN_WARN)

/** 재학습 일정이 안 잡힌 모델 — 손봐야 하는데 언제 손볼지가 없다 */
export const withoutSchedule = (list: PredModel[]): PredModel[] =>
  list.filter((m) => m.nextRetrainOn === null)

export type DriftItem = {
  feature: string
  /** 분포가 얼마나 이동했나 */
  psi: number
  note: string
}

/** 통상 0.2를 넘으면 들여다본다 */
export const PSI_WATCH = 0.2

export const drifting = (list: DriftItem[]): DriftItem[] => list.filter((d) => d.psi > PSI_WATCH)

export type RetrainRun = {
  id: string
  modelId: string
  trigger: string
  startedAt: string
  /** 지금 도는 모델의 점수 */
  champion: number
  /** 새로 만든 모델의 점수 */
  challenger: number
  direction: MetricDirection
  /** 아직 안 바꿨으면 null */
  promotedOn: string | null
  note: string
}

/** 새 모델이 더 나은가 — 방향을 여기서 흡수한다 */
export const challengerWins = (r: RetrainRun): boolean =>
  r.direction === 'higher' ? r.challenger > r.champion : r.challenger < r.champion

/** 더 나은데 아직 안 바꾼 것 — 좋아진 채로 서랍에 있다 */
export const awaitingPromotion = (list: RetrainRun[]): RetrainRun[] =>
  list.filter((r) => r.promotedOn === null && challengerWins(r))
