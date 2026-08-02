/**
 * 지식 검색 fixture.
 *
 * 1위 도면이 왜 1위이고 2위가 왜 밀렸는지가 속성 대조에서 드러나야 한다.
 * 전부 일치시키면 '왜 유사한가'를 보여 주는 화면이 죽은 코드가 된다.
 *
 * ⚠️ `simulateSearch`는 **서버(검색 엔진)가 할 일의 대역**이다.
 * 실제 엔진이 붙으면 이 파일은 사라지고 `shared/api/knowledge`가 엔드포인트를 부른다.
 * 그래서 entities가 아니라 여기에 뒀다.
 *
 * 검색어마다 결과를 손으로 적어 두는 대신 규칙대로 계산한다 —
 * 적어 둔 몇 개 말고는 전부 같은 결과가 나오는 화면은 '검색'이 아니다.
 */
import type {
  KnowledgeBase,
  KnowledgeRequest,
  KnowledgeResult,
  SearchHit,
  SecurityLevel,
} from '@entities/knowledge/model'

export const KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 'kb-drawings', name: '설계 도면 온톨로지', docCount: 12_400, updatedAt: '2026-03-02' },
  { id: 'kb-design-std', name: '설계 표준·체크리스트', docCount: 26, updatedAt: '2026-02-18' },
  { id: 'kb-cnc-sop', name: 'CNC 가공 작업표준(SOP)', docCount: 38, updatedAt: '2026-01-12' },
  { id: 'kb-maintenance', name: '설비 유지보수 매뉴얼', docCount: 41, updatedAt: '2026-01-20' },
  { id: 'kb-trouble', name: '성형 트러블슈팅 사례집', docCount: 63, updatedAt: '2026-03-05' },
  { id: 'kb-qms', name: '품질경영매뉴얼(ISO 9001)', docCount: 54, updatedAt: '2025-12-01' },
  { id: 'kb-incoming', name: '수입검사 기준서', docCount: 17, updatedAt: '2026-02-01' },
]

/** 진행 중인 신규 사양 — 도면 후보를 무엇과 견주는지 화면이 밝혀야 한다 */
export const REFERENCE_SPEC = '신규 브래킷 M-318'

type CorpusItem = Omit<SearchHit, 'score' | 'matchedTerms'> & {
  /** 전문 검색이 훑는 본문 */
  body: string
  /** 시맨틱 검색이 잇는 개념 — 말이 달라도 걸린다 */
  concepts: string[]
  /** 같은 점수일 때의 우선순위(최신·중요도) */
  weight: number
}

const CORPUS: CorpusItem[] = [
  {
    id: 'kn-hbm-2211',
    title: 'HBM-2211 브래킷 굽힘 금형 (SPCC 2.0T)',
    baseId: 'kb-drawings',
    security: 'confidential',
    snippet: '프로그레시브 5스테이지, 200t 서보 프레스용 굽힘 금형. 스트립 레이아웃 재사용 이력 있음.',
    body:
      'HBM-2211 브래킷 굽힘 금형 SPCC 2.0T 프로그레시브 5스테이지 200t 서보 프레스 ' +
      '굽힘 R3.0 전장 84.5mm 홀 피치 42.0mm 스트립 레이아웃 다이 클리어런스 냉각 채널',
    concepts: ['금형', '브래킷', '굽힘', '프레스', '도면', '성형'],
    weight: 0.95,
    drawing: {
      code: 'HBM-2211',
      year: 2024,
      attributes: [
        { label: '소재', queryValue: 'SPCC 2.0T', candidateValue: 'SPCC 2.0T', matched: true },
        { label: '굽힘 R', queryValue: 'R3.0', candidateValue: 'R3.0', matched: true },
        { label: '전장', queryValue: '84.5mm', candidateValue: '84.5mm', matched: true },
        { label: '홀 피치', queryValue: '38.5mm', candidateValue: '42.0mm', matched: false },
        { label: '스테이지', queryValue: '5', candidateValue: '5', matched: true },
        { label: '프레스 톤수', queryValue: '200t', candidateValue: '200t', matched: true },
      ],
      reusable: ['스트립 레이아웃', '다이 클리어런스 세트', '냉각 채널 배치'],
    },
  },
  {
    id: 'kn-hbm-1987',
    title: 'HBM-1987 브래킷 굽힘 금형 (SPCC 1.6T)',
    baseId: 'kb-drawings',
    security: 'confidential',
    snippet: '소재 두께와 굽힘 R이 달라 그대로 쓰기 어렵다. 패드 압력 개선 이력이 남아 있다.',
    body:
      'HBM-1987 브래킷 굽힘 금형 SPCC 1.6T 굽힘 R2.5 전장 84.5mm 홀 피치 38.5mm ' +
      '5스테이지 200t 패드 압력 0.8 1.2MPa 개선',
    concepts: ['금형', '브래킷', '굽힘', '프레스', '도면'],
    weight: 0.8,
    drawing: {
      code: 'HBM-1987',
      year: 2023,
      attributes: [
        // 소재 두께가 달라 밀렸다 — 1위와의 차이가 여기서 드러나야 한다
        { label: '소재', queryValue: 'SPCC 2.0T', candidateValue: 'SPCC 1.6T', matched: false },
        { label: '굽힘 R', queryValue: 'R3.0', candidateValue: 'R2.5', matched: false },
        { label: '전장', queryValue: '84.5mm', candidateValue: '84.5mm', matched: true },
        { label: '홀 피치', queryValue: '38.5mm', candidateValue: '38.5mm', matched: true },
        { label: '스테이지', queryValue: '5', candidateValue: '5', matched: true },
        { label: '프레스 톤수', queryValue: '200t', candidateValue: '200t', matched: true },
      ],
      reusable: ['패드 압력 개선 이력 (0.8 → 1.2MPa)'],
    },
  },
  {
    id: 'kn-hbm-1642',
    title: 'HBM-1642 스티프너 성형 금형',
    baseId: 'kb-drawings',
    security: 'confidential',
    snippet: '형상 계열이 달라 참고 범위가 좁다. 스트리퍼 구조만 재사용 가능하다.',
    body: 'HBM-1642 스티프너 성형 금형 SPCC 2.0T 굽힘 R5.0 전장 112.0mm 홀 피치 50.0mm 4스테이지 200t 스트리퍼',
    concepts: ['금형', '성형', '프레스', '도면'],
    weight: 0.6,
    drawing: {
      code: 'HBM-1642',
      year: 2022,
      attributes: [
        { label: '소재', queryValue: 'SPCC 2.0T', candidateValue: 'SPCC 2.0T', matched: true },
        { label: '굽힘 R', queryValue: 'R3.0', candidateValue: 'R5.0', matched: false },
        { label: '전장', queryValue: '84.5mm', candidateValue: '112.0mm', matched: false },
        { label: '홀 피치', queryValue: '38.5mm', candidateValue: '50.0mm', matched: false },
        { label: '스테이지', queryValue: '5', candidateValue: '4', matched: false },
        { label: '프레스 톤수', queryValue: '200t', candidateValue: '200t', matched: true },
      ],
      reusable: ['스트리퍼 구조'],
    },
  },
  {
    id: 'kn-prog-std',
    title: '프로그레시브 성형 설계 표준',
    baseId: 'kb-design-std',
    security: 'internal',
    snippet: '스테이지 배분, 스트립 레이아웃, 다이 클리어런스 기본값을 규정한다.',
    body: '프로그레시브 성형 설계 표준 스테이지 배분 스트립 레이아웃 다이 클리어런스 캐리어 폭',
    concepts: ['금형', '설계', '성형', '표준'],
    weight: 0.7,
  },
  {
    id: 'kn-interference',
    title: '설계 간섭 체크 기준',
    baseId: 'kb-design-std',
    security: 'internal',
    snippet: '금형 조립 시 간섭 여부를 확인하는 체크 항목과 허용 간극을 정한다.',
    body: '설계 간섭 체크 기준 조립 간섭 허용 간극 스트리퍼 펀치 홀더 확인 항목',
    concepts: ['설계', '금형', '표준', '점검'],
    weight: 0.55,
  },
  {
    id: 'kn-coolant',
    title: '절삭유 농도 관리 기준',
    baseId: 'kb-cnc-sop',
    security: 'public',
    snippet: '농도 범위와 교체 주기, 측정 방법을 규정한다. 주 1회 굴절계로 측정한다.',
    body: '절삭유 농도 관리 기준 교체 주기 굴절계 측정 주 1회 희석비 방청',
    concepts: ['절삭유', '가공', '점검', '표준'],
    weight: 0.5,
  },
  {
    id: 'kn-vibration',
    title: '프레스 진동 관리 기준과 알람 대응',
    baseId: 'kb-maintenance',
    security: 'public',
    snippet: '진동 RMS 3.5mm/s를 관리 기준으로 하며, 초과 시 운전을 계속하지 않고 보전 진단을 받는다.',
    body: '프레스 진동 RMS 3.5mm/s 관리 기준 알람 예지보전 베어링 계획정지 보전 진단',
    concepts: ['진동', '설비', '보전', '점검', '프레스'],
    weight: 0.75,
  },
  {
    id: 'kn-burr',
    title: '버 과다 발생 원인과 조치 사례',
    baseId: 'kb-trouble',
    security: 'internal',
    snippet: '금형 마모, 클리어런스 과대, 소재 경도 편차가 주된 원인이다. 타수 이력과 함께 판단한다.',
    body: '버 과다 발생 원인 금형 마모 클리어런스 과대 소재 경도 편차 타수 교체 초품 검사',
    concepts: ['버', '금형', '품질', '불량', '성형'],
    weight: 0.65,
  },
  {
    id: 'kn-first-article',
    title: '초품 검사 절차 (ISO 9001)',
    baseId: 'kb-qms',
    security: 'public',
    snippet: '금형 교체 후 초품 검사를 의무화하고 결과를 설비 대장에 기록한다.',
    body: '초품 검사 절차 금형 교체 후 의무 설비 대장 기록 2인 1조 품질 기록',
    concepts: ['품질', '검사', '금형', '표준'],
    weight: 0.6,
  },
  {
    id: 'kn-incoming-spcc',
    title: 'SPCC 수입검사 판정 기준',
    baseId: 'kb-incoming',
    security: 'public',
    snippet: '경도 하한 58.0 HRC, 두께 편차 ±0.05mm를 판정 기준으로 한다.',
    body: 'SPCC 수입검사 판정 기준 경도 58.0 HRC 두께 편차 0.05mm 조건부 합격 로트',
    concepts: ['검사', '품질', '소재', '수입검사'],
    weight: 0.5,
  },
]

const round2 = (n: number): number => Math.round(n * 100) / 100

function terms(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
}

/** 전문 검색: 입력한 말이 그대로 있는가 */
function fulltextMatch(item: CorpusItem, ts: string[]): string[] {
  const hay = `${item.title} ${item.body}`
  return ts.filter((t) => hay.includes(t))
}

/** 시맨틱 검색: 개념으로도 이어진다 — 말이 달라도 걸린다 */
function semanticMatch(item: CorpusItem, ts: string[]): string[] {
  const hay = `${item.title} ${item.body}`
  const found = new Set<string>()
  for (const t of ts) {
    if (hay.includes(t)) {
      found.add(t)
      continue
    }
    const concept = item.concepts.find((c) => c.includes(t) || t.includes(c))
    if (concept) found.add(concept)
  }
  return [...found]
}

/** 설정을 반영한 검색 결과 — 서버가 붙으면 이 함수가 사라진다 */
export function simulateSearch(req: KnowledgeRequest): KnowledgeResult {
  const ts = terms(req.query)
  const inScope = (i: CorpusItem) => req.baseIds.includes(i.baseId)
  const inSecurity = (s: SecurityLevel) => req.security === 'all' || req.security === s

  type Scored = { item: CorpusItem; matched: string[] }
  const scoredAll: Scored[] = CORPUS.map((item) => ({
    item,
    matched: req.mode === 'fulltext' ? fulltextMatch(item, ts) : semanticMatch(item, ts),
  })).filter((s) => s.matched.length > 0)

  // 걸렸는데 필터에 막힌 건수를 따로 센다 — '없다'와 '안 보여 준다'는 다르다
  const excludedByScope = scoredAll.filter((s) => !inScope(s.item)).length
  const excludedBySecurity = scoredAll.filter(
    (s) => inScope(s.item) && !inSecurity(s.item.security),
  ).length

  const visible = scoredAll.filter((s) => inScope(s.item) && inSecurity(s.item.security))

  const ranked = visible
    .map(({ item, matched }) => {
      const coverage = ts.length === 0 ? 0 : matched.length / ts.length
      // 전문 검색은 정확히 일치했으므로 더 높게, 시맨틱은 개념 연결이라 약간 낮게
      const base = req.mode === 'fulltext' ? 0.72 : 0.6
      const score = Math.min(0.99, base + coverage * 0.25 + item.weight * 0.08)
      const hit: SearchHit = {
        id: item.id,
        title: item.title,
        baseId: item.baseId,
        security: item.security,
        snippet: item.snippet,
        score: round2(score),
        matchedTerms: matched,
        ...(item.drawing ? { drawing: item.drawing } : {}),
      }
      return hit
    })
    .sort((a, b) => b.score - a.score)

  const indexedCount = KNOWLEDGE_BASES.filter((b) => req.baseIds.includes(b.id)).reduce(
    (s, b) => s + b.docCount,
    0,
  )

  return {
    query: req.query,
    mode: req.mode,
    indexedCount,
    hits: ranked.slice(0, req.topK),
    truncated: Math.max(0, ranked.length - req.topK),
    excludedBySecurity,
    excludedByScope,
    elapsedSeconds: round2(req.mode === 'semantic' ? 4.7 : 2.3),
  }
}
