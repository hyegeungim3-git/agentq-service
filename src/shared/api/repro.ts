import type { Snapshot } from '@entities/repro/model'
import { SNAPSHOTS } from '@fixtures/repro'
import type { ApiResult } from './domains'

/**
 * 답변 재현성의 데이터 경계.
 *
 * ⚠️ 스냅샷 응답에 **질의·답변 원문을 담지 않기를 요청한다.** 접근 로그·이용 이력이
 * 이미 '본문은 남기지 않는다'는 전제로 서 있다(§3-7). 여기만 원문이 오면 세 화면이
 * 서로 다른 말을 하게 된다. 원문을 보관하기로 정하면 그때 필드를 추가한다.
 *
 * 재현 실행은 **성공한 척하지 않는다.** 그때의 모델 가중치와 색인을 실제로 불러
 * 돌려야 결과가 나온다. 서버 없이 '결과 일치'를 띄우면, 심사에서 재현해 봤다고
 * 말하게 된다(업로드·계정 정지와 같은 처리 — D-009).
 */

export function fetchSnapshots(): Promise<ApiResult<Snapshot[]>> {
  // TODO(api-미확정): GET /repro/snapshots 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: SNAPSHOTS })
}

export function runReproduction(id: string): Promise<ApiResult<never>> {
  // TODO(api-미확정): POST /repro/snapshots/{id}:run 으로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({
    ok: false,
    error: `재현은 그때의 모델 가중치와 색인(${id})을 실제로 불러와야 합니다. 서버가 연결되지 않아 실행하지 못했습니다.`,
  })
}
