/**
 * 공공(한국부동산원) 챗봇.
 *
 * 제조 팩과 같은 세 종류를 갖춘다.
 *  ① 근거가 확실한 답 — 출처와 높은 신뢰도
 *  ② 근거는 있으나 확신이 낮은 답 — '확인 권장'과 다음 에이전트 안내
 *  ③ 모르는 질문 — 지어내지 않는다
 *
 * ⚠️ 인용 원문을 여기에 다시 적지 않는다. **원 소유자에게서 가져온다** —
 * 지침은 문서 본문에서, 법령·규정은 내규 조회 조항에서.
 * 같은 조항을 두 화면이 다르게 인용하면 어느 쪽이 맞는지 알 수 없다.
 */
import type { ChatMessage, ChatSource, FaqItem } from '@entities/chat/model'
import type { ChatEntry } from '../chat'
import { PUBLIC_DOCUMENTS } from './documents'
import { PUBLIC_REGULATIONS } from './regulation'
import { LAND_PRICE_CHANGE } from './mapintel'

/** 문서 본문에서 '제N장 …' 단락을 뽑는다. 못 찾으면 null */
function findChapter(documentId: string, heading: string): string | null {
  const doc = PUBLIC_DOCUMENTS.find((d) => d.id === documentId)
  if (!doc) return null
  const hit = doc.text.split(/\n\s*\n/).find((b) => b.startsWith(heading))
  return hit ? hit.slice(heading.length).trim() : null
}

/** 내규 조회가 쓰는 조항 원문을 그대로 가져온다. 못 찾으면 null */
function findClause(clause: string): { text: string; revisedOn: string } | null {
  for (const e of PUBLIC_REGULATIONS) {
    const c = e.answer.citations.find((x) => x.clause === clause)
    if (c) return { text: c.text, revisedOn: c.revisedOn }
  }
  return null
}

function fromDocument(title: string, documentId: string, heading: string): ChatSource {
  return { title, locator: heading, passage: findChapter(documentId, heading), revisedOn: null }
}

function fromRegulation(clause: string): ChatSource {
  const hit = findClause(clause)
  const [title, ...rest] = clause.split(' ')
  return {
    title: title ?? clause,
    locator: rest.join(' '),
    passage: hit?.text ?? null,
    revisedOn: hit?.revisedOn ?? null,
  }
}

const GUIDE = '표준지공시지가 조사·평가 지침'

export const PUBLIC_CHAT: ChatEntry[] = [
  {
    keywords: ['이용상황', '조사표'],
    reply: {
      text: '직전 연도와 이용상황이 달라진 필지는 조사표에 변동 사유를 반드시 기재해야 합니다. 사유가 없으면 검증 단계에서 반려됩니다. 조사표 제출 마감은 4월 5일입니다.',
      sources: [fromDocument(GUIDE, 'doc-reb-guide', '제2장 현장조사 절차')],
      confidence: 0.93,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '지침 조항 직접 일치', weight: 0.6, detail: '제2장이 조사표 기재 의무와 반려 사유를 모두 규정한다' },
          { label: '문서 최신성', weight: 0.25, detail: '2026년 개정본이며 상위 법령과 충돌이 없다' },
          { label: '용어 일치', weight: 0.15, detail: "'이용상황'이 공시업무 표준 용어와 같다" },
        ],
        caveat: '필지별 예외(개발제한구역·공익사업 편입 등)가 있을 수 있습니다. 해당 지자체 협의 내용을 함께 확인하십시오.',
      },
    },
  },
  {
    keywords: ['이의신청', '기한', '처리'],
    reply: {
      text: '이의신청은 공시일부터 30일 이내에 접수하고, 접수일부터 30일 이내에 처리해 서면으로 통지합니다. 현재 미처리 18건의 처리 기한은 4월 12일입니다.',
      sources: [
        fromRegulation('부동산 가격공시에 관한 법률 제7조 제1항'),
        fromDocument(GUIDE, 'doc-reb-guide', '제5장 이의신청 처리'),
      ],
      confidence: 0.9,
      map: null,
      xai: {
        factors: [
          { label: '법령 조항 일치', weight: 0.52, detail: '법 제7조가 신청 기한을, 지침 제5장이 처리 기한을 정한다' },
          { label: '현재 처리 현황 참조', weight: 0.31, detail: '미처리 18건과 기한 4월 12일을 함께 인용했다' },
          { label: '용어 일치', weight: 0.17, detail: "'이의신청'이 법령 용어와 같다" },
        ],
        caveat: '인용한 18건은 마지막 집계값입니다. 건별 진행 상태는 조회로 확인하십시오.',
      },
      handoff: {
        agentLabel: '데이터 조회',
        reason: '건별 처리 상태와 담당자를 표로 보려면 데이터 조회 에이전트가 더 정확합니다.',
      },
    },
  },
  {
    keywords: ['괴리', '의심', '거래', '정밀조사'],
    reply: {
      text: '시세 대비 괴리율이 30% 이상인 거래를 정밀조사 대상으로 분류합니다. 1분기 신고 1,842건 중 8건이 해당하며, 3건은 특수관계인 간 거래로 확인되어 지자체에 통보했습니다.',
      sources: [
        fromRegulation('실거래 검증 매뉴얼 제4장'),
        fromRegulation('부동산 거래신고 등에 관한 법률 제6조 제1항'),
      ],
      confidence: 0.88,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '판정 기준 조항 일치', weight: 0.5, detail: '매뉴얼 제4장이 괴리율 30% 기준을 정한다' },
          { label: '법적 근거 확인', weight: 0.28, detail: '자료 제출 요구 권한이 법 제6조에 있다' },
          { label: '현재 검증 결과 참조', weight: 0.22, detail: '1,842건 중 8건이라는 이번 분기 값을 인용했다' },
        ],
        caveat: '괴리율은 시세 산정 시점에 따라 달라집니다. 판정 근거는 검증 대장 원본으로 확인하십시오.',
      },
    },
  },
  {
    keywords: ['출장', '여비'],
    reply: {
      text: '국내 출장 여비는 공무원 여비 규정을 준용해 실비 정산합니다. 현장조사 출장은 조사 계획서에 일정과 대상 필지를 미리 적어야 합니다.',
      sources: [fromRegulation('복무규정 제31조 제1항')],
      confidence: 0.71,
      map: null,
      xai: {
        factors: [
          { label: '조항 일치', weight: 0.46, detail: '복무규정 제31조가 여비 지급 방식을 정한다' },
          { label: '질문 범위 불확실', weight: 0.36, detail: '국내/해외, 숙박 포함 여부가 질문에 없어 국내 기준으로 답했다' },
          { label: '개정일 확인', weight: 0.18, detail: '2025-04-01 개정본이며 이후 변경 이력은 확인하지 못했다' },
        ],
        caveat: '해외 출장이나 숙박이 포함되면 기준이 다릅니다. 조항 원문을 확인하십시오.',
      },
      handoff: {
        agentLabel: '내규·규정 조회',
        reason: '조항 원문과 개정 이력까지 보려면 내규·규정 조회 에이전트를 쓰십시오.',
      },
    },
  },
  {
    keywords: ['가격 균형', '경계', '협의'],
    reply: {
      text: '인접 시·군·구 경계로부터 500미터 이내 표준지가 협의 대상이며, 변동률 차이가 3%포인트를 넘으면 협의 조서를 작성합니다.',
      sources: [fromDocument(GUIDE, 'doc-reb-guide', '제3장 가격 균형 협의')],
      confidence: 0.86,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '지침 조항 직접 일치', weight: 0.58, detail: '제3장이 거리와 변동률 기준을 함께 규정한다' },
          { label: '기준 개정 예정', weight: 0.24, detail: '거리·차이 기준 조정이 검토 중이라는 공지가 있다' },
          { label: '용어 일치', weight: 0.18, detail: "'가격 균형 협의'가 지침 용어와 같다" },
        ],
        caveat: '기준 개정이 검토 중입니다(3월 25일 공지). 확정 전에는 현행 기준으로 처리하십시오.',
      },
    },
  },
  {
    keywords: ['시도', '변동률', '지역', '공시지가'],
    reply: {
      text: '2026년 표준지 공시지가 변동률은 시·도별로 아래와 같습니다. 세종(5.12%)이 가장 높고, 울산과 제주는 아직 확정값이 없습니다.',
      sources: [fromDocument('2026년 1분기 부동산시장 동향조사', 'doc-reb-market', '2. 주요 지표')],
      confidence: 0.82,
      handoff: null,
      map: LAND_PRICE_CHANGE,
      xai: {
        factors: [
          { label: '집계표 직접 참조', weight: 0.54, detail: '시장동향조사 2절의 시·도별 집계를 그대로 옮겼다' },
          { label: '미확정 지역 표시', weight: 0.29, detail: '울산·제주는 값이 없다는 사실을 함께 말한다' },
          { label: '기준일 명시', weight: 0.17, detail: '기준일 2026-01-01 공시분이다' },
        ],
        caveat: '평균은 값이 있는 15개 시·도의 평균입니다. 전국 평균이 아닙니다.',
      },
    },
  },
]

/** 매칭 실패 — 지어내지 않는다 */
export const PUBLIC_CHAT_UNKNOWN: Omit<ChatMessage, 'id' | 'role'> = {
  text: '이 질문에 답할 근거를 사내 문서와 법령에서 찾지 못했습니다. 확실하지 않은 내용을 지어내지 않기 위해 답변을 비워 둡니다. 질문을 구체화하시거나 담당 부서에 문의하십시오.',
  sources: [],
  confidence: null,
  handoff: null,
  xai: null,
  map: null,
}

/**
 * 자주 묻는 질문.
 *
 * 보안 항목은 일부러 **답할 수 없는 질문**으로 뒀다. 목록에 있다고 다 답할 수 있는
 * 것은 아니고, 근거가 없으면 없다고 말해야 한다 — 그 경로가 목록에서도 닿아야 한다.
 */
export const PUBLIC_FAQ: FaqItem[] = [
  { category: 'standard', question: '이용상황이 바뀌면 조사표에 무엇을 적나요?' },
  { category: 'standard', question: '경계 지역 가격 균형 협의 기준이 어떻게 되나요?' },
  { category: 'labor', question: '출장 여비 기준 알려줘' },
  { category: 'quality', question: '이의신청 처리 기한이 어떻게 되나요?' },
  { category: 'quality', question: '실거래 의심 거래 판정 기준이 무엇인가요?' },
  { category: 'security', question: '개인 노트북 반출 절차가 어떻게 되나요?' },
  { category: 'system', question: '시도별 공시지가 변동률 보여줘' },
]
