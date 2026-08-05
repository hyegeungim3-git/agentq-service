import type { Workspace } from '@entities/workspace/model'
import type { ApiResult } from './domains'
import { withPack } from './pack'

export function fetchWorkspaces(): Promise<ApiResult<Workspace[]>> {
  // TODO(api-미확정): GET /workspaces 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPack((p) => p.workspaces)
}
