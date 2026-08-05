/**
 * OCR fixture.
 *
 * 신뢰도가 낮은 줄을 일부러 섞었다. 전부 99%면 '못 읽은 곳' 표시가
 * 죽은 코드가 되고, 실제 스캔본에서 흐릿한 줄이 나올 때 화면이 대응하지 못한다.
 *
 * ⚠️ 아래 `simulateOcr`은 **서버가 할 일을 흉내 낸 것**이다. 실제 OCR 엔진이
 * 붙으면 이 파일은 통째로 사라지고 `shared/api/ocr`이 엔드포인트를 부른다.
 * 그래서 이 계산을 entities에 두지 않았다 — 도메인 규칙이 아니라 임시 대역이다.
 *
 * 그럼에도 규칙대로 계산하는 이유: 설정 조합마다 결과를 손으로 적어 두면
 * 3×2×2×2×3 = 72가지가 되고, 결국 몇 개는 설정과 무관한 같은 결과를 돌려주게 된다.
 * 그건 '고른 것이 반영되지 않는 화면'이고 이 저장소가 없애려는 것이다.
 */
import type {
  MaskEntry,
  OcrFormat,
  OcrLine,
  OcrRequest,
  OcrResult,
  OcrSpecField,
  OcrTableRow,
} from '@entities/ocr/model'

/** 시뮬레이션에 필요한 줄 속성 — 서버가 붙으면 함께 사라진다 */
export type OcrBaseLine = OcrLine & {
  /** 이 줄에 섞인 문자 종류. 인식 언어와 맞지 않으면 신뢰도가 떨어진다 */
  script: 'ko' | 'en' | 'mixed'
  /** 숫자·기호가 판정을 좌우하는 줄 */
  numeric: boolean
  /** 표 추출을 켰을 때 뽑히는 행 */
  tableRow?: OcrTableRow
  /** 성적서 특화 모드에서 규격 대비 판정까지 뽑히는 항목 */
  spec?: OcrSpecField
  /** 마스킹을 켰을 때 이 줄이 어떻게 바뀌는가. 없으면 그대로 */
  maskedText?: string
  /** 마스킹을 켰을 때 표의 값이 어떻게 바뀌는가 */
  maskedTableValue?: string
}

/** 인식 대상 문서 한 벌 — 발주처마다 다르다 */
export type OcrCorpus = {
  /** 내보내기 제목 */
  title: string
  lines: OcrBaseLine[]
  masks: MaskEntry[]
}

const BASE: OcrBaseLine[] = [
  { index: 0, text: '수입검사 성적서', confidence: 0.99, script: 'ko', numeric: false },
  {
    index: 1,
    text: '공급업체: 대성정밀공업(주)',
    confidence: 0.97,
    script: 'ko',
    numeric: false,
    tableRow: { label: '공급업체', value: '대성정밀공업(주)' },
  },
  {
    index: 2,
    text: '담당자: 정하늘  연락처: 010-4821-7734',
    confidence: 0.95,
    script: 'ko',
    numeric: false,
    tableRow: { label: '담당자', value: '정하늘 / 010-4821-7734' },
    maskedText: '담당자: 정○○  연락처: 010-****-7734',
    maskedTableValue: '정○○ / 010-****-7734',
  },
  {
    index: 3,
    text: '품명: 냉간압연강판 SPCC 2.0T',
    confidence: 0.98,
    script: 'mixed',
    numeric: false,
    tableRow: { label: '품명', value: '냉간압연강판 SPCC 2.0T' },
  },
  {
    index: 4,
    text: '로트번호: SPCC-2211',
    confidence: 0.96,
    script: 'en',
    numeric: false,
    tableRow: { label: '로트번호', value: 'SPCC-2211' },
  },
  // 흐릿하게 찍힌 줄 — 숫자를 잘못 읽으면 판정이 뒤집힌다
  {
    index: 5,
    text: '경도: 58.4 HRC (규격 58.0 이상)',
    confidence: 0.71,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '경도', value: '58.4 HRC' },
    spec: { field: '경도', value: '58.4 HRC', limit: '58.0 HRC 이상', withinSpec: true },
  },
  {
    index: 6,
    text: '두께 편차: ±0.03mm',
    confidence: 0.82,
    script: 'mixed',
    numeric: true,
    tableRow: { label: '두께 편차', value: '±0.03mm' },
    spec: { field: '두께 편차', value: '±0.03mm', limit: '±0.05mm 이내', withinSpec: true },
  },
  {
    index: 7,
    text: '판정: 조건부 합격',
    confidence: 0.94,
    script: 'ko',
    numeric: false,
    tableRow: { label: '판정', value: '조건부 합격' },
  },
  {
    index: 8,
    text: '검사일: 2026-03-14',
    confidence: 0.97,
    script: 'ko',
    numeric: true,
    tableRow: { label: '검사일', value: '2026-03-14' },
  },
]

export const OCR_MASKS: MaskEntry[] = [
  { kind: 'name', original: '정하늘', masked: '정○○', lineIndex: 2 },
  { kind: 'phone', original: '010-4821-7734', masked: '010-****-7734', lineIndex: 2 },
]

const round2 = (n: number): number => Math.round(n * 100) / 100

/**
 * 인식 언어가 문서와 맞지 않을 때의 손실.
 * 한국어 전용으로 영문 규격기호를 읽으면 놓치고, 영어 전용으로 한글을 읽으면 더 크게 놓친다.
 */
function languagePenalty(script: OcrBaseLine['script'], language: OcrRequest['language']): number {
  if (language === 'ko-en') return 1
  if (language === 'ko') return script === 'ko' ? 1 : 0.78
  return script === 'en' ? 1 : 0.62
}

function buildExport(
  format: OcrFormat,
  title: string,
  lines: OcrLine[],
  table: OcrTableRow[],
  specs: OcrSpecField[],
): string {
  if (format === 'markdown') {
    const body = lines.map((l) => `${l.index + 1}. ${l.text}`).join('\n')
    const tbl = table.length
      ? `\n\n| 항목 | 값 |\n| --- | --- |\n${table.map((r) => `| ${r.label} | ${r.value} |`).join('\n')}`
      : ''
    return `# ${title}\n\n${body}${tbl}`
  }
  if (format === 'json') {
    return JSON.stringify(
      {
        lines: lines.map((l) => ({ index: l.index, text: l.text, confidence: l.confidence })),
        table,
        specFields: specs,
      },
      null,
      2,
    )
  }
  return lines.map((l) => l.text).join('\n')
}

/**
 * 설정을 반영한 인식 결과를 만드는 함수를 찍어 낸다 — 서버가 붙으면 함께 사라진다.
 *
 * 문서(코퍼스)를 밖에서 받는다. 안에 못박아 두면 발주처를 바꿔도 제조 성적서가
 * 그대로 인식된다 — 검색 코퍼스에서 이미 밟은 함정이다.
 */
export function makeOcrSimulator(corpus: OcrCorpus): (req: OcrRequest) => OcrResult {
  return (req) => simulateWith(corpus, req)
}

function simulateWith(corpus: OcrCorpus, req: OcrRequest): OcrResult {
  const notes: string[] = []
  let degraded = 0

  const lines: OcrLine[] = corpus.lines.map((b) => {
    const penalty = languagePenalty(b.script, req.language)
    if (penalty < 1) degraded += 1
    let c = b.confidence * penalty
    // 정밀 인식은 수치 줄만 끌어올린다. 가장 흐린 줄은 그래도 기준을 못 넘는다
    if (req.precisionNumbers && b.numeric) c = Math.min(0.99, c + 0.13)
    const text = req.maskPii && b.maskedText ? b.maskedText : b.text
    return { index: b.index, text, confidence: round2(c) }
  })

  if (degraded > 0) {
    notes.push(
      req.language === 'en'
        ? `영어만으로 인식해 한글이 섞인 ${degraded}줄의 신뢰도가 크게 떨어졌습니다. 언어 설정을 확인하십시오.`
        : `한국어만으로 인식해 영문 규격·기호가 있는 ${degraded}줄의 신뢰도가 떨어졌습니다. 한국어+영어를 권합니다.`,
    )
  }
  if (!req.precisionNumbers) {
    notes.push('수치 정밀 인식이 꺼져 있어 경도·편차 같은 숫자 줄의 신뢰도가 낮습니다.')
  }
  if (!req.maskPii) {
    notes.push('개인정보 마스킹이 꺼져 있어 성명·연락처가 그대로 남습니다.')
  }

  const table: OcrTableRow[] = req.extractTables
    ? corpus.lines.flatMap((b) => {
        if (!b.tableRow) return []
        const row =
          req.maskPii && b.maskedTableValue
            ? { label: b.tableRow.label, value: b.maskedTableValue }
            : b.tableRow
        return [row]
      })
    : []

  const specFields: OcrSpecField[] =
    req.mode === 'inspection' ? corpus.lines.flatMap((b) => (b.spec ? [b.spec] : [])) : []

  // 더 많이 시킬수록 더 오래 걸린다
  const elapsedSeconds = round2(
    9.4 +
      (req.extractTables ? 1.2 : 0) +
      (req.precisionNumbers ? 2.1 : 0) +
      (req.mode === 'inspection' ? 1.6 : 0),
  )

  return {
    documentId: req.documentId,
    lines,
    masks: req.maskPii ? corpus.masks : [],
    table,
    specFields,
    exportText: buildExport(req.format, corpus.title, lines, table, specFields),
    notes,
    elapsedSeconds,
  }
}

/** 제조(한빛정밀)가 인식하는 문서 */
export const OCR_CORPUS: OcrCorpus = { title: '수입검사 성적서', lines: BASE, masks: OCR_MASKS }

export const simulateOcr = makeOcrSimulator(OCR_CORPUS)
