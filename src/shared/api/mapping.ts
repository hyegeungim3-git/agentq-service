import type { MappingMode, MappingRequest, MappingResult } from '@entities/mapping/model'

export type { MappingRequest }
import { makeAddressResolver } from '@fixtures/address'
import type { ApiResult } from './domains'
import { currentPack, withPack } from './pack'

export type MappingApiOptions = { delayMs?: number | undefined }
const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export async function runMapping(
  req: MappingRequest,
  opts: MappingApiOptions = {},
): Promise<ApiResult<MappingResult>> {
  /* 발주처의 대장이 없으면 못 푼다 — 다른 발주처 대장으로 대신 풀지 않는다 */
  const pack = await currentPack()
  if (!pack) {
    return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다. 다른 발주처를 선택하십시오.' }
  }
  /* 처리 유형마다 하는 일이 다르다 — 태그·코드 매핑은 수집 결과를 훑고,
     주소 셋은 입력을 표준 주소로 바꾸고, 코드 역조회는 대장을 되짚는다.
     TODO(api-미확정): POST /mapping:run 로 교체. 제거 조건 = 백엔드가 제안서를 확정. */
  if (req.mode === 'tags') {
    if (!pack.mapping.tagResult) {
      return { ok: false, error: '이 발주처는 태그·코드 매핑을 쓰지 않습니다.' }
    }
    await wait(opts.delayMs ?? 1800)
    return { ok: true, data: pack.mapping.tagResult }
  }

  /* 주소를 안 푸는 발주처에 억지로 답하지 않는다 — 병원은 주소가 아니라 코드를 푼다 */
  const corpus = pack.mapping.address
  if (!corpus) {
    return { ok: false, error: '이 발주처는 주소 표준화를 쓰지 않습니다.' }
  }
  const addr = makeAddressResolver(corpus)

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
    case 'address-single':
      return {
        ok: true,
        data: {
          mode: 'address-single',
          input: req.query,
          resolved: addr.resolveAddress(req.query),
          elapsedSeconds: 1.6,
        },
      }
    case 'address-batch': {
      const rows = addr.resolveBatch(req.batchText)
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
          candidates: addr.extractAddresses(),
          elapsedSeconds: 4.2,
        },
      }
    case 'code-lookup':
      return { ok: true, data: addr.lookupCode(req.query) }
  }
}

/**
 * 이 발주처가 쓰는 처리 유형과 예시.
 *
 * **안 쓰는 유형을 라디오에 두면 고를 수 있는데 아무 일도 안 하는 칸이 된다.**
 * 병원은 주소를 안 풀고 청구 항목 코드를 푼다 — 화면이 그것만 그려야 한다.
 */
export type MappingConfig = {
  modes: MappingMode[]
  tagsTargetNote: string | null
  ocrDocument: string | null
  addressExamples: string[]
  codeExamples: string[]
}

export function fetchMappingConfig(): Promise<ApiResult<MappingConfig>> {
  // TODO(api-미확정): GET /mapping/config 로 교체. 제거 조건 = 백엔드가 테넌시(§3-2)를 확정.
  return withPack((p) => ({
    modes: p.mapping.modes,
    tagsTargetNote: p.mapping.tagsTargetNote,
    ocrDocument: p.mapping.ocrDocument,
    addressExamples: p.mapping.addressExamples,
    codeExamples: p.mapping.codeExamples,
  }))
}
