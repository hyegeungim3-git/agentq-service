/**
 * 예측 모델 운영 fixture.
 *
 * 세계관은 한빛정밀이다. 두 모델은 다른 화면의 사건과 이어진다 —
 * 설비 이상 예지(진동 알람 릴레이), 불량 원인 분류(품질 집계).
 *
 * **지표 방향이 다른 모델을 둘 넣었다.** MAE는 낮을수록 좋고 F1은 높을수록 좋다.
 * 방향이 하나뿐이면 여유 계산이 맞는지 알 수 없다.
 *
 * **임계에 닿은 모델과 재학습 일정이 없는 모델을 넣었다.** 손봐야 하는데 언제
 * 손볼지가 없는 상태가 실제로 가장 자주 있는 상태다.
 */
import type { DriftItem, PredModel, RetrainRun } from '@entities/predops/model'

export const PRED_MODELS: PredModel[] = [
  {
    id: 'pm-1',
    name: '설비 이상 예지 모델',
    task: '회귀 — 잔여 수명 예측',
    version: 'v2.3',
    deployedOn: '2026-04-15',
    metricName: 'MAE(일)',
    direction: 'lower',
    baseline: 8.4,
    current: 9.1,
    threshold: 11.0,
    samples: '월 1,240건',
    owner: '설비보전팀',
    nextRetrainOn: '2026-10-15',
  },
  {
    id: 'pm-2',
    name: '불량 원인 분류 모델',
    task: '다중 분류',
    version: 'v1.8',
    deployedOn: '2025-11-02',
    metricName: 'F1',
    direction: 'higher',
    baseline: 0.91,
    current: 0.86,
    threshold: 0.85,
    samples: '월 3,600건',
    owner: '품질보증팀',
    /* 손봐야 하는데 언제 손볼지가 없다 */
    nextRetrainOn: null,
  },
]

export const DRIFT_ITEMS: DriftItem[] = [
  { feature: '불량 유형 분포', psi: 0.28, note: '신규 유형(침탄 편차) 유입으로 분포가 이동했습니다' },
  { feature: '로트 크기', psi: 0.11, note: '눈에 띄는 변화가 없습니다' },
  { feature: '검사 시간대', psi: 0.07, note: '눈에 띄는 변화가 없습니다' },
]

export const RETRAIN_RUNS: RetrainRun[] = [
  {
    id: 'rr-1',
    modelId: 'pm-2',
    trigger: '성능이 임계에 닿음',
    startedAt: '2026-07-28 02:00',
    champion: 0.86,
    challenger: 0.9,
    direction: 'higher',
    promotedOn: null,
    note: '검증셋에서 좋아진 것을 확인했습니다. 담당자 승인 뒤 배포합니다',
  },
  {
    id: 'rr-2',
    modelId: 'pm-1',
    trigger: '정기(분기)',
    startedAt: '2026-04-15 02:00',
    champion: 8.9,
    challenger: 8.4,
    direction: 'lower',
    promotedOn: '2026-04-15',
    note: 'v2.3으로 배포했습니다',
  },
]
