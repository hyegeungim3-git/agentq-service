/**
 * P4 fixture — 데이터·개발 환경·모델·학습·평가.
 *
 * 세계관은 이어진다. LLM 설정에서 '수치 인용 오류가 반복돼 중지'된 Solar가
 * 여기 평가 기록에 그 근거로 남아 있고, 트레이너 현황에서 실패한 JOB-992가
 * 학습 작업으로 나온다.
 *
 * **일부러 넣은 나쁜 상태 셋.** 없으면 그걸 드러내는 화면이 죽은 코드가 된다.
 *  ① 계보가 끊긴 모델 — 운영 중인데 무슨 데이터로 학습했는지 모른다
 *  ② 학습·평가 겸용 데이터셋 — 평가 점수가 부풀려진다
 *  ③ 8일째 놀면서 GPU 2장을 잡고 있는 워크스페이스
 */
import type { Dataset, EvalResult, ModelVersion, TrainRun, Workspace } from '@entities/mlops/model'

export const DATASETS: Dataset[] = [
  { id: 'ds-sop', name: '작업표준 QA 세트', kind: 'train', rows: 12_400, hasPii: false, piiNote: null, license: '사내 문서 (한빛정밀)', registeredOn: '2026-04-12' },
  { id: 'ds-qa-eval', name: '품질 QA 평가셋', kind: 'eval', rows: 1_200, hasPii: false, piiNote: null, license: '사내 문서 (한빛정밀)', registeredOn: '2026-05-03' },
  /* 학습과 평가에 같이 쓴다 — 점수가 부풀려진다 */
  { id: 'ds-reg', name: '사내 규정 QA 세트', kind: 'both', rows: 3_800, hasPii: false, piiNote: null, license: '사내 문서 (한빛정밀)', registeredOn: '2026-03-20' },
  { id: 'ds-meeting', name: '회의록 요약 세트', kind: 'train', rows: 940, hasPii: true, piiNote: '참석자 실명이 들어 있습니다. 학습 전 가명 처리했고 원본은 별도 보관합니다.', license: '사내 문서 (한빛정밀)', registeredOn: '2026-06-08' },
  /* 출처를 모른다 — 나중에 못 쓰게 될 수 있다 */
  { id: 'ds-web', name: '제조 용어 말뭉치', kind: 'train', rows: 58_000, hasPii: false, piiNote: null, license: null, registeredOn: '2026-02-15' },
]

export const WORKSPACES: Workspace[] = [
  { id: 'w-1', owner: '박태윤', purpose: '작업표준 QA 파인튜닝', gpuCount: 2, lastActiveAt: '2026-08-02 07:40', idleDays: 0 },
  { id: 'w-2', owner: '정하늘', purpose: '품질 평가셋 구축', gpuCount: 1, lastActiveAt: '2026-08-01 18:10', idleDays: 1 },
  /* 8일째 놀면서 GPU 2장을 잡고 있다 */
  { id: 'w-3', owner: '한지민', purpose: '임베딩 실험(종료 미신고)', gpuCount: 2, lastActiveAt: '2026-07-25 11:20', idleDays: 8 },
  { id: 'w-4', owner: '오세진', purpose: '예지보전 모델 검토', gpuCount: 0, lastActiveAt: '2026-07-20 09:00', idleDays: 13 },
]

export const MODEL_VERSIONS: ModelVersion[] = [
  { id: 'mv-1', name: 'GPT-OSS-120B', version: 'v2.4.1', stage: 'production', trainJobId: 'JOB-974', datasetIds: ['ds-sop', 'ds-reg'], registeredOn: '2026-07-18' },
  { id: 'mv-2', name: 'Llama-3-Kor-Instruct', version: 'v1.8.0', stage: 'production', trainJobId: 'JOB-991', datasetIds: ['ds-reg'], registeredOn: '2026-08-01' },
  /* 계보가 끊겼다 — 운영 중인데 무슨 데이터로 학습했는지 모른다 */
  { id: 'mv-3', name: 'EXAONE-3.0-7.8B', version: 'v1.3.2', stage: 'production', trainJobId: null, datasetIds: [], registeredOn: '2026-01-30' },
  { id: 'mv-4', name: 'GPT-OSS-120B', version: 'v2.5.0', stage: 'staging', trainJobId: 'JOB-992', datasetIds: ['ds-sop', 'ds-meeting'], registeredOn: '2026-08-02' },
  { id: 'mv-5', name: 'Solar-10.7B-v1.0', version: 'v1.0.0', stage: 'archived', trainJobId: 'JOB-880', datasetIds: ['ds-web'], registeredOn: '2026-05-20' },
]

export const TRAIN_RUNS: TrainRun[] = [
  { id: 'JOB-992', model: 'GPT-OSS-120B', method: 'LoRA', datasetIds: ['ds-sop', 'ds-meeting'], startedAt: '2026-08-02 14:30', state: 'failed', note: 'genos-ai-01 GPU 2 과열로 중단(78°C). 트레이너 현황의 그 작업입니다.', gpuHours: 6.2 },
  { id: 'JOB-991', model: 'Llama-3-Kor', method: 'QLoRA', datasetIds: ['ds-reg'], startedAt: '2026-08-01 09:00', state: 'done', note: null, gpuHours: 18.4 },
  { id: 'VLM-102', model: 'InternVL-2-8B', method: 'VLM', datasetIds: ['ds-sop'], startedAt: '2026-08-02 10:00', state: 'running', note: null, gpuHours: 9.1 },
  { id: 'JOB-988', model: 'GPT-OSS-120B', method: 'LoRA', datasetIds: [], startedAt: '2026-07-29 22:10', state: 'failed', note: '학습 데이터셋 경로가 비어 있었습니다.', gpuHours: 0.3 },
  { id: 'JOB-974', model: 'GPT-OSS-120B', method: 'LoRA', datasetIds: ['ds-sop', 'ds-reg'], startedAt: '2026-07-18 11:20', state: 'done', note: null, gpuHours: 42.7 },
]

export const EVAL_RESULTS: EvalResult[] = [
  { id: 'ev-1', modelName: 'GPT-OSS-120B', modelVersion: 'v2.4.1', datasetId: 'ds-qa-eval', score: 0.876, metric: '정답 일치율', evaluatedOn: '2026-07-19', trustworthy: true, caveat: null },
  /* 학습에도 쓴 데이터로 평가했다 — 점수가 부풀려진다 */
  { id: 'ev-2', modelName: 'GPT-OSS-120B', modelVersion: 'v2.4.1', datasetId: 'ds-reg', score: 0.958, metric: '정답 일치율', evaluatedOn: '2026-07-19', trustworthy: false, caveat: '이 데이터셋은 학습에도 썼습니다. 점수가 실제보다 높게 나옵니다 — 배포 판단에 쓰지 마십시오.' },
  { id: 'ev-3', modelName: 'Llama-3-Kor-Instruct', modelVersion: 'v1.8.0', datasetId: 'ds-qa-eval', score: 0.812, metric: '정답 일치율', evaluatedOn: '2026-08-01', trustworthy: true, caveat: null },
  { id: 'ev-4', modelName: 'GPT-OSS-120B', modelVersion: 'v2.5.0', datasetId: 'ds-qa-eval', score: 0.884, metric: '정답 일치율', evaluatedOn: '2026-08-02', trustworthy: true, caveat: null },
  /* LLM 설정에서 '수치 인용 오류가 반복돼 중지'된 근거 */
  { id: 'ev-5', modelName: 'Solar-10.7B-v1.0', modelVersion: 'v1.0.0', datasetId: 'ds-qa-eval', score: 0.641, metric: '정답 일치율', evaluatedOn: '2026-06-12', trustworthy: true, caveat: null },
]
