import type { BillingMonth, OpLogEntry, OpLogKind, UsageBucket } from '@entities/oplog/model'
import type { Notice } from '@entities/notice/model'
import type { FaqItem } from '@entities/chat/model'
import {
  ACCESS_AS_OPLOG,
  MONTH_ELAPSED_DAYS,
  MONTH_TOTAL_DAYS,
  EXPORT_LOGS,
  OPERATION_LOGS,
  QUERY_LOGS,
  USAGE_BUCKETS,
} from '@fixtures/oplog'
import { NOTICES } from '@fixtures/notices'
import { FAQ_ITEMS } from '@fixtures/chat'
import type { ApiResult } from './domains'

/**
 * 통합 로그·사용량·콘텐츠의 데이터 경계.
 *
 * **콘텐츠는 사용자 포털이 보는 것과 같은 데이터를 준다.** 관리자 화면이 따로
 * 목록을 갖고 있으면, 여기서 고쳤는데 포털에 안 나오는 상태가 생긴다.
 * 지금은 같은 fixture를 읽고, 서버가 붙어도 같은 자원을 가리킨다.
 */

const BY_KIND: Record<OpLogKind, OpLogEntry[]> = {
  access: ACCESS_AS_OPLOG,
  operation: OPERATION_LOGS,
  query: QUERY_LOGS,
  export: EXPORT_LOGS,
}

export function fetchOpLogs(kind: OpLogKind): Promise<ApiResult<OpLogEntry[]>> {
  // TODO(api-미확정): GET /audit/logs?kind= 로 교체. 제거 조건 = 백엔드가 보관 정책을 확정.
  return Promise.resolve({ ok: true, data: BY_KIND[kind] })
}

export function exportLogsCsv(kind: OpLogKind): Promise<ApiResult<never>> {
  void kind
  // TODO(api-미확정): GET /audit/logs.csv?kind= 로 교체. 제거 조건 = 백엔드가 파일 생성 경로를 확정.
  return Promise.resolve({
    ok: false,
    error:
      'CSV를 내려받지 못했습니다. 파일은 서버가 만듭니다 — 화면에 보이는 것만 모아 내보내면 조회 조건 밖의 기록이 빠진 채로 나갑니다.',
  })
}

export function fetchUsageBuckets(): Promise<ApiResult<UsageBucket[]>> {
  // TODO(api-미확정): GET /usage/buckets 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: USAGE_BUCKETS })
}

/** 사용자 포털의 공지와 **같은 자원**이다 */
export function fetchManagedNotices(): Promise<ApiResult<Notice[]>> {
  // TODO(api-미확정): GET /notices 로 교체(포털과 같은 엔드포인트). 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: NOTICES })
}

/** 사용자 포털의 자주 묻는 질문과 **같은 자원**이다 */
export function fetchManagedFaq(): Promise<ApiResult<FaqItem[]>> {
  // TODO(api-미확정): GET /chat/faq 로 교체(포털과 같은 엔드포인트). 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: FAQ_ITEMS })
}

export function saveNotice(notice: Pick<Notice, 'title' | 'level'>): Promise<ApiResult<never>> {
  void notice
  // TODO(api-미확정): POST /notices 로 교체. 제거 조건 = 백엔드가 인증·권한을 확정.
  return Promise.resolve({
    ok: false,
    error:
      '공지를 저장하지 못했습니다. 서버가 연결되지 않아 사용자 포털에는 아무 것도 올라가지 않았습니다.',
  })
}

/**
 * 청구 월이 얼마나 지났나 — **서버가 말해야 하는 값**이다.
 *
 * '이 속도면 며칠 뒤 한도를 넘는다'는 판정이 여기에 걸린다. 화면이 fixture 상수를
 * 직접 읽으면 서버가 붙어도 옛 진행도로 계산해 **틀린 날짜를 자신 있게 말한다.**
 * 청구 주기는 요금제마다 다르므로 브라우저가 달력으로 유추할 수도 없다.
 */
export function fetchBillingMonth(): Promise<ApiResult<BillingMonth>> {
  // TODO(api-미확정): GET /usage/period 로 교체. 제거 조건 = 백엔드가 요금 주기를 확정.
  return Promise.resolve({
    ok: true,
    data: { elapsedDays: MONTH_ELAPSED_DAYS, totalDays: MONTH_TOTAL_DAYS },
  })
}
