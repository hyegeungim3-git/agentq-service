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
import { CLUSTER, GPU_NODES, NODES, PODS, SERVICES, TRAINER } from '@fixtures/infra'
import type { ApiResult } from './domains'

/**
 * 관리자 대시보드의 데이터 경계.
 *
 * ⚠️ 여기서 나오는 값은 **전부 예시**다. 서버가 붙기 전까지 화면은 반드시
 * '서버 미연결 — 예시 값'을 함께 그린다. 배지가 사라지는 것으로 연결 여부를
 * 눈으로 확인할 수 있다.
 *
 * 구간(`window`)은 서버 질의 조건이다 — 화면이 받아 온 목록을 잘라 쓰는 게 아니라
 * 구간마다 다른 집계를 요청한다. 클라이언트에서 자르면 '최근 7일'을 보려고
 * 전 기간을 내려받게 된다.
 */

export function fetchCluster(): Promise<ApiResult<ClusterResource>> {
  // TODO(api-미확정): GET /infra/cluster 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: CLUSTER })
}

export function fetchNodes(): Promise<ApiResult<NodeInfo[]>> {
  // TODO(api-미확정): GET /infra/nodes 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: NODES })
}

export function fetchPods(window: PodWindow): Promise<ApiResult<PodInfo[]>> {
  // TODO(api-미확정): GET /infra/pods?window= 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: PODS[window] })
}

export function fetchServices(): Promise<ApiResult<ServiceStatus[]>> {
  // TODO(api-미확정): GET /infra/services 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SERVICES })
}

export function fetchGpuNodes(): Promise<ApiResult<GpuNode[]>> {
  // TODO(api-미확정): GET /infra/gpus 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: GPU_NODES })
}

export function fetchTrainerReport(window: TrainWindow): Promise<ApiResult<TrainerReport>> {
  // TODO(api-미확정): GET /training/report?window= 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: TRAINER[window] })
}
