import type { MappingMode, MappingResult } from '@entities/mapping/model'
import { extractAddresses, lookupCode, resolveAddress, resolveBatch } from '@fixtures/address'
import { MAPPING_RESULT } from '@fixtures/mapping'
import type { ApiResult } from './domains'

export type MappingApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export type MappingRequest = {
  mode: MappingMode
  /** 단일 주소·코드 역조회의 입력 */
  query: string
  /** 일괄 처리 입력 — 줄바꿈으로 구분 */
  batchText: string
  /** OCR 대상 문서 이름 */
  documentName: string
}

export async function runMapping(
  req: MappingRequest,
  opts: MappingApiOptions = {},
): Promise<ApiResult<MappingResult>> {
  /* 처리 유형마다 하는 일이 다르다 — 태그 매핑은 수집 결과를 훑고,
     주소 셋은 입력을 표준 주소로 바꾸고, 코드 역조회는 대장을 되짚는다.
     TODO(api-미확정): POST /mapping:run 로 교체. 제거 조건 = 백엔드가 제안서를 확정. */
  if (req.mode === 'address-single' && req.query.trim().length === 0) {
    return { ok: false, error: '변환할 주소를 입력해 주세요.' }
  }
  if (req.mode === 'code-lookup' && req.query.trim().length === 0) {
    return { ok: false, error: '조회할 법정동코드를 입력해 주세요.' }
  }
  if (req.mode === 'address-batch' && req.batchText.trim().length === 0) {
    return { ok: false, error: '표준화할 목록을 입력해 주세요.' }
  }

  await wait(opts.delayMs ?? 1800)

  switch (req.mode) {
    case 'tags':
      return { ok: true, data: MAPPING_RESULT }
    case 'address-single':
      return {
        ok: true,
        data: {
          mode: 'address-single',
          input: req.query,
          resolved: resolveAddress(req.query),
          elapsedSeconds: 1.6,
        },
      }
    case 'address-batch': {
      const rows = resolveBatch(req.batchText)
      return {
        ok: true,
        data: {
          mode: 'address-batch',
          rows,
          elapsedSeconds: Math.round(rows.length * 0.4 * 10) / 10,
        },
      }
    }
    case 'address-ocr':
      return {
        ok: true,
        data: {
          mode: 'address-ocr',
          documentName: req.documentName,
          candidates: extractAddresses(),
          elapsedSeconds: 4.2,
        },
      }
    case 'code-lookup':
      return { ok: true, data: lookupCode(req.query) }
  }
}
