import type { Notice } from '@entities/notice/model'
import type { ApiResult } from './domains'
import { withPack } from './pack'

export function fetchNotices(): Promise<ApiResult<Notice[]>> {
  // TODO(api-미확정): GET /notices 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPack((p) => p.notices)
}
