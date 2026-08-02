import type { Workspace } from '@entities/workspace/model'
import { WORKSPACES } from '@fixtures/workspaces'
import type { ApiResult } from './domains'

export function fetchWorkspaces(): Promise<ApiResult<Workspace[]>> {
  // TODO(api-미확정): GET /workspaces 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return Promise.resolve({ ok: true, data: WORKSPACES })
}
