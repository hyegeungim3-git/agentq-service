/**
 * 관리자 대시보드 fixture — 전부 **예시 값**이다.
 *
 * 이전 데모의 수치를 옮기되 두 가지를 더 넣었다.
 *  ① 구간을 고르면 실제로 달라지는 값 — 고른 것이 결과를 바꿔야 한다
 *  ② 나쁜 상태의 **이유와 조치** — 'Warning'만 띄우면 손쓸 수 없다
 *
 * 한 이야기로 묶었다: genos-ai-01의 GPU 2가 과열·과부하이고, 그 노드에서 도는
 * 학습 작업(JOB-992)이 실패했으며, 알림 서비스가 그 실패를 못 보냈다.
 * 화면 세 개가 같은 사건의 다른 면을 보여 준다.
 */
import type {
  ClusterResource,
  GpuNode,
  NodeInfo,
  PodInfo,
  PodWindow,
  ServiceStatus,
  TrainWindow,
  TrainerReport,
} from '@entities/infra/model'

export const CLUSTER: ClusterResource = {
  cpuRatio: 0.0532,
  memoryRatio: 0.359,
  filesystemRatio: 0.584,
  gpuPowerWatt: 26.5,
}

export const NODES: NodeInfo[] = [
  {
    name: 'genos01',
    instance: '10.0.4.11:9100',
    os: 'Linux',
    kernel: '5.15.0-91-generic',
    cpuRatio: 0.0028,
    memoryRatio: 0.046,
  },
  {
    name: 'genos02',
    instance: '10.0.4.12:9100',
    os: 'Linux',
    kernel: '5.15.0-91-generic',
    cpuRatio: 0.13,
    memoryRatio: 0.432,
  },
  {
    name: 'genos03',
    instance: '10.0.4.13:9100',
    os: 'Linux',
    kernel: '5.15.0-91-generic',
    cpuRatio: 0.0469,
    memoryRatio: 0.184,
  },
]

/**
 * 구간별 파드 집계.
 *
 * 구간을 넓히면 짧은 구간에서는 안 보이던 것이 드러난다 — 이미 끝난 배치,
 * 재시작을 반복하다 죽은 파드. 어느 구간에서나 같은 목록이 나오면
 * 구간 선택은 있으나 마나다.
 */
export const PODS: Record<PodWindow, PodInfo[]> = {
  '1h': [
    { name: 'genos-api-7f8b9c-x2k4p', namespace: 'production', cpuMilli: 120, memoryMib: 256, phase: 'Running', restarts: 0 },
    { name: 'llm-serving-gpt-oss-0', namespace: 'serving', cpuMilli: 4000, memoryMib: 32768, phase: 'Running', restarts: 0 },
    { name: 'vector-db-milvus-0', namespace: 'data', cpuMilli: 500, memoryMib: 4096, phase: 'Running', restarts: 0 },
  ],
  '6h': [
    { name: 'genos-api-7f8b9c-x2k4p', namespace: 'production', cpuMilli: 120, memoryMib: 256, phase: 'Running', restarts: 0 },
    { name: 'llm-serving-gpt-oss-0', namespace: 'serving', cpuMilli: 4000, memoryMib: 32768, phase: 'Running', restarts: 0 },
    { name: 'embedding-worker-1', namespace: 'training', cpuMilli: 2000, memoryMib: 8192, phase: 'Running', restarts: 0 },
    { name: 'vector-db-milvus-0', namespace: 'data', cpuMilli: 500, memoryMib: 4096, phase: 'Running', restarts: 0 },
    { name: 'scheduler-cron-abc12', namespace: 'system', cpuMilli: 50, memoryMib: 128, phase: 'Completed', restarts: 0 },
  ],
  '24h': [
    { name: 'genos-api-7f8b9c-x2k4p', namespace: 'production', cpuMilli: 120, memoryMib: 256, phase: 'Running', restarts: 0 },
    { name: 'llm-serving-gpt-oss-0', namespace: 'serving', cpuMilli: 4000, memoryMib: 32768, phase: 'Running', restarts: 0 },
    { name: 'embedding-worker-1', namespace: 'training', cpuMilli: 2000, memoryMib: 8192, phase: 'Running', restarts: 0 },
    { name: 'vector-db-milvus-0', namespace: 'data', cpuMilli: 500, memoryMib: 4096, phase: 'Running', restarts: 0 },
    { name: 'scheduler-cron-abc12', namespace: 'system', cpuMilli: 50, memoryMib: 128, phase: 'Completed', restarts: 0 },
    /* 24시간으로 넓혀야 보인다 — 조용히 재시작을 반복하던 파드 */
    { name: 'notify-relay-6d4f2', namespace: 'system', cpuMilli: 80, memoryMib: 192, phase: 'Failed', restarts: 7 },
    { name: 'train-job-992-worker', namespace: 'training', cpuMilli: 8000, memoryMib: 65536, phase: 'Failed', restarts: 2 },
  ],
  '7d': [
    { name: 'genos-api-7f8b9c-x2k4p', namespace: 'production', cpuMilli: 120, memoryMib: 256, phase: 'Running', restarts: 0 },
    { name: 'llm-serving-gpt-oss-0', namespace: 'serving', cpuMilli: 4000, memoryMib: 32768, phase: 'Running', restarts: 0 },
    { name: 'embedding-worker-1', namespace: 'training', cpuMilli: 2000, memoryMib: 8192, phase: 'Running', restarts: 0 },
    { name: 'vector-db-milvus-0', namespace: 'data', cpuMilli: 500, memoryMib: 4096, phase: 'Running', restarts: 0 },
    { name: 'scheduler-cron-abc12', namespace: 'system', cpuMilli: 50, memoryMib: 128, phase: 'Completed', restarts: 0 },
    { name: 'notify-relay-6d4f2', namespace: 'system', cpuMilli: 80, memoryMib: 192, phase: 'Failed', restarts: 7 },
    { name: 'train-job-992-worker', namespace: 'training', cpuMilli: 8000, memoryMib: 65536, phase: 'Failed', restarts: 2 },
    { name: 'train-job-991-worker', namespace: 'training', cpuMilli: 8000, memoryMib: 65536, phase: 'Completed', restarts: 0 },
    { name: 'eval-batch-20260706', namespace: 'training', cpuMilli: 1000, memoryMib: 4096, phase: 'Completed', restarts: 0 },
    { name: 'backup-milvus-weekly', namespace: 'data', cpuMilli: 200, memoryMib: 1024, phase: 'Completed', restarts: 0 },
  ],
}

/* 'Warning'만 띄우면 무엇을 해야 하는지 알 수 없다 — 이유와 조치를 함께 준다 */
export const SERVICES: ServiceStatus[] = [
  { id: 'sso', name: '인증 서비스 (SSO)', role: '사용자 통합 인증', level: 'ok', uptimeHours: 338, reason: null, action: null },
  { id: 'serving', name: '모델 서빙 API', role: 'LLM 추론 엔드포인트', level: 'ok', uptimeHours: 338, reason: null, action: null },
  { id: 'vector', name: '벡터 DB 서비스', role: 'RAG 검색 엔진', level: 'ok', uptimeHours: 338, reason: null, action: null },
  { id: 'logcollector', name: '로그 수집기', role: '시스템/감사 로그', level: 'ok', uptimeHours: 338, reason: null, action: null },
  {
    id: 'notify',
    name: '알림 서비스',
    role: 'Slack/Email 연동',
    level: 'warn',
    uptimeHours: 5,
    reason: '중계 파드가 24시간 동안 7회 재시작했습니다. 학습 실패 알림 3건이 전송되지 않았습니다.',
    action: '시스템 현황에서 notify-relay 파드 로그를 확인하고, 미발송 3건은 수동으로 공지하십시오.',
  },
  { id: 'scheduler', name: '작업 스케줄러', role: '배치 작업 관리', level: 'ok', uptimeHours: 338, reason: null, action: null },
]

export const GPU_NODES: GpuNode[] = [
  {
    name: 'genos-ai-01',
    model: 'NVIDIA H200 NVL',
    vramGb: 141,
    cards: [
      { index: 0, utilRatio: 0.82, vramRatio: 0.65, celsius: 72, watt: 650 },
      { index: 1, utilRatio: 0.78, vramRatio: 0.62, celsius: 70, watt: 640 },
      { index: 2, utilRatio: 0.95, vramRatio: 0.88, celsius: 78, watt: 680 },
      { index: 3, utilRatio: 0.45, vramRatio: 0.3, celsius: 55, watt: 320 },
    ],
  },
  {
    name: 'genos-ai-02',
    model: 'NVIDIA H200 NVL',
    vramGb: 141,
    cards: [
      { index: 0, utilRatio: 0.12, vramRatio: 0.1, celsius: 45, watt: 210 },
      { index: 1, utilRatio: 0.05, vramRatio: 0.08, celsius: 42, watt: 190 },
      { index: 2, utilRatio: 0, vramRatio: 0.02, celsius: 38, watt: 150 },
      { index: 3, utilRatio: 0, vramRatio: 0.02, celsius: 38, watt: 150 },
    ],
  },
  {
    name: 'genos-db-01',
    model: 'NVIDIA L40S',
    vramGb: 48,
    cards: [
      { index: 0, utilRatio: 0.32, vramRatio: 0.45, celsius: 58, watt: 210 },
      { index: 1, utilRatio: 0.28, vramRatio: 0.4, celsius: 56, watt: 190 },
      { index: 2, utilRatio: 0.15, vramRatio: 0.2, celsius: 45, watt: 120 },
      { index: 3, utilRatio: 0.1, vramRatio: 0.15, celsius: 42, watt: 110 },
    ],
  },
]

/**
 * 구간별 학습 집계.
 *
 * 실패 건수만 세면 손쓸 수 없다. 실패한 작업에 사유를 달았다 —
 * JOB-992는 genos-ai-01의 과열된 카드에서 돌다 죽었다(GPU 현황과 같은 사건).
 */
export const TRAINER: Record<TrainWindow, TrainerReport> = {
  day: {
    window: 'day',
    done: 3,
    failed: 1,
    queued: 2,
    allocations: [
      { label: 'LLM 학습', ratio: 0.55 },
      { label: 'RAG 임베딩', ratio: 0.18 },
      { label: '추론', ratio: 0.2 },
    ],
    jobs: [
      { id: 'JOB-992', model: 'GPT-OSS-120B', kind: 'LoRA', startedAt: '2026-08-02 14:30', state: 'failed', note: 'genos-ai-01 GPU 2 과열로 중단(78°C). 다른 노드로 재배치가 필요합니다.' },
      { id: 'VLM-102', model: 'InternVL-2-8B', kind: 'VLM', startedAt: '2026-08-02 10:00', state: 'running', note: null },
      { id: 'EMB-005', model: 'KoE5-large', kind: '임베딩', startedAt: '2026-08-02 08:10', state: 'done', note: null },
    ],
  },
  week: {
    window: 'week',
    done: 24,
    failed: 2,
    queued: 3,
    allocations: [
      { label: 'LLM 학습', ratio: 0.6 },
      { label: 'RAG 임베딩', ratio: 0.2 },
      { label: '추론', ratio: 0.15 },
    ],
    jobs: [
      { id: 'JOB-992', model: 'GPT-OSS-120B', kind: 'LoRA', startedAt: '2026-08-02 14:30', state: 'failed', note: 'genos-ai-01 GPU 2 과열로 중단(78°C). 다른 노드로 재배치가 필요합니다.' },
      { id: 'JOB-991', model: 'Llama-3-Kor', kind: 'QLoRA', startedAt: '2026-08-01 09:00', state: 'done', note: null },
      { id: 'VLM-102', model: 'InternVL-2-8B', kind: 'VLM', startedAt: '2026-08-02 10:00', state: 'running', note: null },
      { id: 'EMB-003', model: 'KoE5-large', kind: '임베딩', startedAt: '2026-07-31 16:00', state: 'done', note: null },
      { id: 'JOB-988', model: 'GPT-OSS-120B', kind: 'LoRA', startedAt: '2026-07-29 22:10', state: 'failed', note: '학습 데이터셋 경로가 비어 있었습니다. 데이터 관리에서 버전을 확인하십시오.' },
    ],
  },
  month: {
    window: 'month',
    done: 96,
    failed: 7,
    queued: 3,
    allocations: [
      { label: 'LLM 학습', ratio: 0.52 },
      { label: 'RAG 임베딩', ratio: 0.26 },
      { label: '추론', ratio: 0.14 },
    ],
    jobs: [
      { id: 'JOB-992', model: 'GPT-OSS-120B', kind: 'LoRA', startedAt: '2026-08-02 14:30', state: 'failed', note: 'genos-ai-01 GPU 2 과열로 중단(78°C). 다른 노드로 재배치가 필요합니다.' },
      { id: 'JOB-991', model: 'Llama-3-Kor', kind: 'QLoRA', startedAt: '2026-08-01 09:00', state: 'done', note: null },
      { id: 'VLM-102', model: 'InternVL-2-8B', kind: 'VLM', startedAt: '2026-08-02 10:00', state: 'running', note: null },
      { id: 'EMB-003', model: 'KoE5-large', kind: '임베딩', startedAt: '2026-07-31 16:00', state: 'done', note: null },
      { id: 'JOB-988', model: 'GPT-OSS-120B', kind: 'LoRA', startedAt: '2026-07-29 22:10', state: 'failed', note: '학습 데이터셋 경로가 비어 있었습니다. 데이터 관리에서 버전을 확인하십시오.' },
      { id: 'JOB-974', model: 'Qwen2.5-32B', kind: 'LoRA', startedAt: '2026-07-18 11:20', state: 'done', note: null },
      { id: 'EMB-001', model: 'BGE-m3', kind: '임베딩', startedAt: '2026-07-09 13:40', state: 'done', note: null },
    ],
  },
}
