import type { MappingResult } from '@entities/mapping/model'
import { MAPPING_RESULT } from '@fixtures/mapping'
import type { ApiResult } from './domains'

export type MappingApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function analyzeMapping(opts: MappingApiOptions = {}): Promise<ApiResult<MappingResult>> {
  await wait(opts.delayMs ?? 1800)
  return { ok: true, data: MAPPING_RESULT }
}
