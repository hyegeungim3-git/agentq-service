/**
 * 데이터 · 개발 환경 · 모델 · 학습 · 평가.
 *
 * ⚠️ P4는 **전부 인프라 수치**다. 업무 로직이 없어 숫자 자체가 전부이므로
 * 모든 화면이 `서버 미연결 — 예시 값` 배지를 단다(SCOPE-PLAN §3-7).
 *
 * 이 구역에서 가장 위험한 것 둘:
 *  ① **계보가 끊긴 모델** — 운영 중인데 무슨 데이터로 학습했는지 모른다.
 *     개인정보 삭제 요청이 오면 어느 모델을 다시 학습해야 하는지 답할 수 없다.
 *  ② **평가셋이 학습셋과 겹침** — 점수가 부풀려진다. 높은 점수를 보고 배포한다.
 * 둘 다 오류가 나지 않으므로 화면이 말하지 않으면 아무도 모른다.
 */

export type DatasetKind = 'train' | 'eval' | 'both'

export const DATASET_KIND_LABEL: Record<DatasetKind, string> = {
  train: '학습용',
  eval: '평가용',
  both: '학습·평가 겸용',
}

export type Dataset = {
  id: string
  name: string
  kind: DatasetKind
  rows: number
  /** 개인정보가 들어 있는가 */
  hasPii: boolean
  /** 개인정보 처리 상태. 없으면 null */
  piiNote: string | null
  /** 출처·라이선스. 확인 안 됐으면 null */
  license: string | null
  registeredOn: string
}

/** 출처를 모르는 데이터 — 나중에 못 쓰게 될 수 있다 */
export const unlicensed = (list: Dataset[]): Dataset[] => list.filter((d) => d.license === null)

/** 학습과 평가에 같이 쓰는 데이터 — 점수가 부풀려진다 */
export const leaky = (list: Dataset[]): Dataset[] => list.filter((d) => d.kind === 'both')

export type Workspace = {
  id: string
  owner: string
  purpose: string
  gpuCount: number
  /** 마지막으로 실제 계산이 돈 시각 */
  lastActiveAt: string
  /** 며칠째 놀고 있는가. 쓰고 있으면 0 */
  idleDays: number
}

export const IDLE_LIMIT_DAYS = 7

/** 놀고 있는데 GPU를 잡고 있는 것 */
export const idleHolding = (list: Workspace[]): Workspace[] =>
  list.filter((w) => w.idleDays >= IDLE_LIMIT_DAYS && w.gpuCount > 0)

export type ModelStage = 'production' | 'staging' | 'archived'

export const MODEL_STAGE_LABEL: Record<ModelStage, string> = {
  production: '운영',
  staging: '검증',
  archived: '보관',
}

export type ModelVersion = {
  id: string
  name: string
  version: string
  stage: ModelStage
  /** 이 버전을 만든 학습 작업 id. 모르면 null */
  trainJobId: string | null
  /** 학습에 쓴 데이터셋 id. 모르면 빈 배열 */
  datasetIds: string[]
  registeredOn: string
}

/**
 * 계보가 끊긴 모델.
 *
 * 운영 중인데 무슨 데이터로 학습했는지 모르면, 개인정보 삭제 요청이 왔을 때
 * 어느 모델을 다시 학습해야 하는지 답할 수 없다.
 */
export const untraceable = (list: ModelVersion[]): ModelVersion[] =>
  list.filter((m) => m.trainJobId === null || m.datasetIds.length === 0)

/** 학습 유형 — 이전 데모는 메뉴 넷으로 나눠 뒀다. 표 모양이 같아 필터로 둔다 */
export type TrainKind = 'llm' | 'vlm' | 'embedding' | 'rerank'

export const TRAIN_KIND_LABEL: Record<TrainKind, string> = {
  llm: 'LLM 파인튜닝',
  vlm: 'VLM 학습',
  embedding: '임베딩 학습',
  rerank: '리랭킹 학습',
}

export const TRAIN_KINDS: TrainKind[] = ['llm', 'vlm', 'embedding', 'rerank']

export type TrainRun = {
  id: string
  kind: TrainKind
  /** 유형마다 다른 설정 — 무엇으로 돌렸는지 없으면 재현할 수 없다 */
  config: { label: string; value: string }[]
  model: string
  method: string
  datasetIds: string[]
  startedAt: string
  state: 'running' | 'done' | 'failed'
  /** 실패했으면 사유 */
  note: string | null
  gpuHours: number
}

export type EvalResult = {
  id: string
  modelName: string
  modelVersion: string
  datasetId: string
  /** 0~1 */
  score: number
  metric: string
  evaluatedOn: string
  /** 이 평가가 믿을 만한가 — 학습셋과 겹치면 false */
  trustworthy: boolean
  /** 못 믿는 이유 */
  caveat: string | null
}

export const untrusted = (list: EvalResult[]): EvalResult[] => list.filter((e) => !e.trustworthy)

/** 운영 중인데 평가 기록이 없는 모델 */
export function unevaluated(models: ModelVersion[], evals: EvalResult[]): ModelVersion[] {
  return models.filter(
    (m) => m.stage === 'production' && !evals.some((e) => e.modelVersion === m.version && e.modelName === m.name),
  )
}
