/**
 * LLM 운영 — 모델·신뢰성·답변 품질.
 *
 * 이 구역의 위험은 **효과를 숫자로 적어 두면 검증된 것처럼 보인다**는 점이다.
 * '정확도 +18.4%'는 언제 무엇으로 잰 것인지 없으면 아무 뜻이 없다. 그래서
 * 측정 결과에는 잰 시점과 표본 수를 함께 두고, **아직 안 잰 것은 `null`로 둔다.**
 * `0`이나 `'-'`로 두면 효과가 없는 것으로 읽히고, 평균에 섞이면 평균이 무너진다.
 */

export type ModelState = 'running' | 'stopped'

export const MODEL_STATE_LABEL: Record<ModelState, string> = {
  running: '가동 중',
  stopped: '중지됨',
}

export type ModelEntry = {
  id: string
  name: string
  base: string
  version: string
  state: ModelState
  /** 중지된 이유. 가동 중이면 null */
  stoppedReason: string | null
  temperature: number
  contextTokens: number
  purpose: string
  /** 이 모델을 쓰는 업무 */
  usedBy: string[]
  promptVersions: number
}

/** 효과 측정값 — 언제 무엇으로 쟀는지 없으면 숫자가 뜻을 잃는다 */
export type Measurement = {
  /** 정확도 향상 비율(0~1). 아직 안 쟀으면 null */
  gain: number | null
  /** 측정 표본 수. 안 쟀으면 null */
  samples: number | null
  measuredOn: string | null
}

export type RerankPipeline = {
  id: string
  agentLabel: string
  model: string
  topK: number
  threshold: number
  enabled: boolean
  measurement: Measurement
}

/** 측정된 것만 평균 낸다 — 안 잰 것을 0으로 세면 효과가 없어 보인다 */
export function averageGain(list: RerankPipeline[]): { value: number | null; counted: number } {
  const measured = list.filter((p) => p.measurement.gain !== null)
  if (measured.length === 0) return { value: null, counted: 0 }
  const sum = measured.reduce((n, p) => n + (p.measurement.gain as number), 0)
  return { value: sum / measured.length, counted: measured.length }
}

export type GuardrailRule = {
  id: string
  name: string
  description: string
  enabled: boolean
  /** 최근 7일 적용 건수 */
  hits: number
  /** 껐을 때 무엇이 통과하게 되는지 — 끄기 전에 알아야 한다 */
  riskIfOff: string
}

export type ReviewVerdict = 'accurate' | 'needsFix' | 'hallucination'

export const VERDICT_LABEL: Record<ReviewVerdict, string> = {
  accurate: '정확',
  needsFix: '수정 필요',
  hallucination: '할루시네이션',
}

export const VERDICTS: ReviewVerdict[] = ['accurate', 'needsFix', 'hallucination']

export type QualityReview = {
  id: string
  agentLabel: string
  reviewedOn: string
  question: string
  answer: string
  confidence: number
  verdict: ReviewVerdict
  /** 검토자가 남긴 말. 안 남겼으면 null */
  note: string | null
  reviewer: string
}

/** 검토된 답변 중 손봐야 하는 비율 */
export function defectRatio(reviews: QualityReview[]): number | null {
  if (reviews.length === 0) return null
  const bad = reviews.filter((r) => r.verdict !== 'accurate').length
  return bad / reviews.length
}

/**
 * 자동 응답 임계값.
 *
 * 이 값 아래면 사람이 확인하도록 넘긴다. 값만 보여 주면 무슨 뜻인지 알 수 없어
 * 화면이 '넘겼을 때 어떻게 되는지'를 함께 말한다.
 */
export type ConfidencePolicy = {
  autoAnswerThreshold: number
  /** 임계값 아래일 때 하는 일 */
  belowAction: string
}
