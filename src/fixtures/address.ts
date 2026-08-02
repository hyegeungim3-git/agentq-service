/**
 * 주소 표준화 fixture.
 *
 * ⚠️ 아래 `resolveAddress`는 **주소 정제 서버가 할 일의 대역**이다.
 * 실제 주소 API가 붙으면 이 파일은 사라지고 `shared/api/mapping`이 엔드포인트를 부른다.
 *
 * 입력마다 결과를 손으로 적어 두지 않고 규칙으로 푼다 — 적어 둔 몇 개 말고는
 * 전부 같은 답이 나오는 화면은 '표준화'가 아니다.
 *
 * 세 갈래 판정을 일부러 다 만든다.
 *   auto   건물까지 특정됨
 *   review 도로명까지는 맞지만 동·호가 없거나 후보가 둘 이상
 *   none   AI로 안 됨 — 미등록 주소·해외 주소처럼 사람이 확인해야 하는 것
 * none을 review에 섞으면 '검토만 하면 다 된다'는 착각을 만든다.
 */
import type {
  AddressResolution,
  BatchAddressRow,
  CodeLookupResult,
  OcrAddressCandidate,
} from '@entities/mapping/model'

type AddressEntry = {
  /** 검색에 쓰는 표기들 — 현장에서 실제로 쓰는 축약·구표기 */
  aliases: string[]
  roadAddress: string
  jibunAddress: string
  postalCode: string
  legalCode: string
  /** 건물까지 특정되는가. 아니면 동·호 확인이 필요하다 */
  buildingResolved: boolean
  note: string
}

const ADDRESS_BOOK: AddressEntry[] = [
  {
    aliases: ['창원본사', '창원 본사', '창원공장', '경남 창원 성산구 공단로 274'],
    roadAddress: '경상남도 창원시 성산구 공단로 274',
    jibunAddress: '경상남도 창원시 성산구 신촌동 100-3',
    postalCode: '51573',
    legalCode: '4812310300',
    buildingResolved: true,
    note: '사업장 대장 등록 주소와 일치',
  },
  {
    aliases: ['아산공장', '아산 프레스동', '충남 아산 둔포 아산밸리로'],
    roadAddress: '충청남도 아산시 둔포면 아산밸리로 158',
    jibunAddress: '충청남도 아산시 둔포면 신항리 285',
    postalCode: '31418',
    legalCode: '4420037000',
    buildingResolved: true,
    note: '사업장 대장 등록 주소와 일치',
  },
  {
    aliases: ['대성정밀공업', '대성정밀', '부산 사상구 학감대로'],
    roadAddress: '부산광역시 사상구 학감대로 123',
    jibunAddress: '부산광역시 사상구 감전동 137-8',
    postalCode: '46988',
    legalCode: '2653010200',
    // 같은 도로명에 공장동이 여러 개라 동·호가 없으면 특정되지 않는다
    buildingResolved: false,
    note: '협력사 등록 주소 — 동·호 미기재',
  },
  {
    aliases: ['한빛테크', '광주 하남산단', '광주 광산구 하남산단'],
    roadAddress: '광주광역시 광산구 하남산단6번로 107',
    jibunAddress: '광주광역시 광산구 장덕동 1274',
    postalCode: '62234',
    legalCode: '2920011900',
    buildingResolved: false,
    note: '협력사 등록 주소 — 산단 내 동 번호 확인 필요',
  },
]

const norm = (s: string): string => s.replace(/[\s(),]/g, '').toLowerCase()

function fail(blocker: string, basisDetail: string): AddressResolution {
  return {
    status: 'none',
    confidence: 0,
    roadAddress: null,
    jibunAddress: null,
    postalCode: null,
    legalCode: null,
    basis: [{ label: '판정', detail: basisDetail }],
    alternatives: [],
    blocker,
  }
}

/** 비정형 주소 한 줄을 표준 주소로 — 서버가 붙으면 이 함수가 사라진다 */
export function resolveAddress(input: string): AddressResolution {
  const q = norm(input)
  if (q.length === 0) {
    return fail('입력이 비어 있습니다.', '변환할 문자열이 없음')
  }

  // 해외 주소는 국내 주소 체계로 표준화할 수 없다 — 되는 척하지 않는다
  if (/[a-z]{4,}/.test(q) && !/[가-힣]/.test(input)) {
    return fail(
      '해외 주소는 국내 도로명주소 체계로 변환할 수 없습니다. 해외 사업장 대장에서 관리하십시오.',
      '한글 주소 표기 없음',
    )
  }

  const hits = ADDRESS_BOOK.filter((e) => e.aliases.some((a) => q.includes(norm(a)) || norm(a).includes(q)))

  if (hits.length === 0) {
    return fail(
      '주소 대장에서 찾지 못했습니다. 신규 사업장이면 대장 등록이 먼저 필요합니다.',
      '별칭·도로명 어느 쪽으로도 일치 항목 없음',
    )
  }

  const [best, ...rest] = hits as [AddressEntry, ...AddressEntry[]]
  const hasDetail = /\d+동|\d+호|\d+층/.test(input)
  const resolved = best.buildingResolved || hasDetail
  const ambiguous = rest.length > 0

  const basis = [
    { label: '매칭 근거', detail: best.note },
    { label: '도로명', detail: best.roadAddress },
    { label: '법정동코드', detail: best.legalCode },
  ]

  if (ambiguous) {
    return {
      status: 'review',
      confidence: 0.62,
      roadAddress: best.roadAddress,
      jibunAddress: best.jibunAddress,
      postalCode: best.postalCode,
      legalCode: best.legalCode,
      basis,
      alternatives: rest.map((e) => ({
        code: e.legalCode,
        name: e.roadAddress,
        confidence: 0.55,
        reason: '입력 표기가 두 사업장 모두와 겹칩니다',
      })),
      blocker: null,
    }
  }

  if (!resolved) {
    return {
      status: 'review',
      confidence: 0.74,
      roadAddress: best.roadAddress,
      jibunAddress: best.jibunAddress,
      postalCode: best.postalCode,
      legalCode: best.legalCode,
      basis: [...basis, { label: '확인 필요', detail: '같은 도로명에 동이 여러 개 — 동·호가 없어 건물 미특정' }],
      alternatives: [],
      blocker: null,
    }
  }

  return {
    status: 'auto',
    confidence: 0.96,
    roadAddress: best.roadAddress,
    jibunAddress: best.jibunAddress,
    postalCode: best.postalCode,
    legalCode: best.legalCode,
    basis,
    alternatives: [],
    blocker: null,
  }
}

/** 일괄 처리 기본 예시 — 세 판정이 모두 나오도록 골랐다 */
export const BATCH_SAMPLE = [
  '창원본사 공단로 274',
  '대성정밀공업 부산 사상구 학감대로',
  '한빛테크 광주 하남산단',
  '아산공장 아산밸리로 158',
  '(주)신원금속 인천 남동공단 3차',
  '1F, 21 Jurong East St 31, Singapore',
].join('\n')

export function resolveBatch(text: string): BatchAddressRow[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((input, i) => ({ id: `row-${i}`, input, resolved: resolveAddress(input) }))
}

/**
 * OCR로 뽑은 주소 후보.
 * OCR 신뢰도가 낮은 줄은 주소가 맞는지부터 의심해야 하므로 표준화 불가로 둔다 —
 * 잘못 읽은 글자로 만든 '정상 주소'가 제일 위험하다.
 */
const OCR_LINES: { text: string; lineNo: number; ocrConfidence: number }[] = [
  { text: '공급업체: 대성정밀공업(주) 부산 사상구 학감대로 123', lineNo: 2, ocrConfidence: 0.94 },
  { text: '납품처: 한빛정밀 창원본사 공단로 274', lineNo: 5, ocrConfidence: 0.97 },
  { text: '경유지: 광주 하남산단6번로 1O7', lineNo: 9, ocrConfidence: 0.63 },
]

export function extractAddresses(): OcrAddressCandidate[] {
  return OCR_LINES.map((l, i) => ({
    id: `ocr-${i}`,
    text: l.text,
    lineNo: l.lineNo,
    ocrConfidence: l.ocrConfidence,
    resolved:
      l.ocrConfidence < 0.85
        ? fail(
            'OCR 신뢰도가 낮아 원문을 신뢰할 수 없습니다. 원본과 대조한 뒤 다시 처리하십시오.',
            `OCR 신뢰도 ${Math.round(l.ocrConfidence * 100)}% — 기준 85% 미만`,
          )
        : resolveAddress(l.text),
  }))
}

/** 법정동코드 → 주소. 폐지 코드를 하나 남겼다 — 실제 대장에는 반드시 있다 */
const LEGAL_CODES: Record<string, { road: string; jibun: string; superseded: string | null; note: string }> = {
  '4812310300': {
    road: '경상남도 창원시 성산구 공단로 274',
    jibun: '경상남도 창원시 성산구 신촌동',
    superseded: null,
    note: '현행 코드',
  },
  '4420037000': {
    road: '충청남도 아산시 둔포면 아산밸리로 158',
    jibun: '충청남도 아산시 둔포면 신항리',
    superseded: null,
    note: '현행 코드',
  },
  '2653010200': {
    road: '부산광역시 사상구 학감대로 123',
    jibun: '부산광역시 사상구 감전동',
    superseded: null,
    note: '현행 코드',
  },
  '4812110100': {
    road: '경상남도 창원시 의창구 (구 창원시 중앙동)',
    jibun: '경상남도 창원시 의창구 중앙동',
    superseded: '4812110200',
    note: '행정구역 개편으로 폐지된 코드',
  },
}

export function lookupCode(code: string): CodeLookupResult {
  const key = code.replace(/\D/g, '')
  const hit = LEGAL_CODES[key]

  if (!hit) {
    return {
      mode: 'code-lookup',
      code,
      found: null,
      status: 'none',
      blocker:
        key.length === 10
          ? '코드 체계에는 맞지만 대장에 없는 코드입니다. 행정구역 개편 이력을 확인하십시오.'
          : '법정동코드는 10자리입니다. 자릿수를 확인하십시오.',
      elapsedSeconds: 1.1,
    }
  }

  return {
    mode: 'code-lookup',
    code: key,
    found: {
      roadAddress: hit.road,
      jibunAddress: hit.jibun,
      legalCode: key,
      supersededBy: hit.superseded,
      note: hit.note,
    },
    // 폐지된 코드는 조회는 되지만 그대로 쓰면 안 된다
    status: hit.superseded ? 'review' : 'auto',
    blocker: null,
    elapsedSeconds: 1.4,
  }
}
