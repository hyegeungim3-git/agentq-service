/**
 * 행정(한성시청) 챗봇.
 *
 * 앞의 두 팩과 같은 세 종류를 갖춘다 — 확실한 답 / 확신이 낮은 답 / 모르는 질문.
 *
 * ⚠️ 인용 원문은 원 소유자에게서 가져온다. 지침은 문서 본문에서,
 * 법령·조례는 내규 조회 조항에서.
 *
 * ⚠️ 키워드 충돌에 주의한다. 앞선 팩에서 '변동'이 '변동률'에 걸려 지도 질문을
 * 가로챈 적이 있다 — 좁은 말만 키워드로 둔다.
 */
import type { ChatMessage, ChatSource, FaqItem } from '@entities/chat/model'
import type { ChatEntry } from '../chat'
import { CIVIC_DOCUMENTS } from './documents'
import { CIVIC_REGULATIONS } from './regulation'
import { CIVIC_COMPLAINT_RATE } from './mapintel'

function findChapter(documentId: string, heading: string): string | null {
  const doc = CIVIC_DOCUMENTS.find((d) => d.id === documentId)
  if (!doc) return null
  const hit = doc.text.split(/\n\s*\n/).find((b) => b.startsWith(heading))
  return hit ? hit.slice(heading.length).trim() : null
}

function findClause(clause: string): { text: string; revisedOn: string } | null {
  for (const e of CIVIC_REGULATIONS) {
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

const GUIDE = '민원사무 처리지침'

export const CIVIC_CHAT: ChatEntry[] = [
  {
    keywords: ['기한', '연장'],
    reply: {
      text: '법정 기한 내 처리가 어려우면 연장 사유와 연장 기간을 민원인에게 미리 통지해야 합니다. 통지 없이 넘긴 건은 감사 지적 대상이며, 1분기 기한 도과는 118건입니다.',
      sources: [
        fromRegulation('민원 처리에 관한 법률 제21조'),
        fromDocument(GUIDE, 'doc-hsc-guide', '제3장 처리 기한'),
      ],
      confidence: 0.92,
      map: null,
      xai: {
        factors: [
          { label: '법령·지침 조항 일치', weight: 0.56, detail: '법 제21조가 연장 요건을, 지침 제3장이 통지 의무를 정한다' },
          { label: '현재 도과 현황 참조', weight: 0.28, detail: '1분기 118건이라는 집계값을 함께 인용했다' },
          { label: '용어 일치', weight: 0.16, detail: "'처리 기한'이 법령 용어와 같다" },
        ],
        caveat: '인용한 118건은 분기 집계입니다. 건별 진행 상태는 조회로 확인하십시오.',
      },
      handoff: {
        agentLabel: '데이터 조회',
        reason: '기한 도과 민원을 부서·유형별로 보려면 데이터 조회 에이전트가 더 정확합니다.',
      },
    },
  },
  {
    keywords: ['이송', '소관'],
    reply: {
      text: '소관이 아닌 민원은 접수일부터 2일 이내에 이송하고 민원인에게 통지합니다. 이송 사유를 적지 않으면 반려됩니다.',
      sources: [fromDocument(GUIDE, 'doc-hsc-guide', '제2장 접수와 이송')],
      confidence: 0.94,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '지침 조항 직접 일치', weight: 0.62, detail: '제2장이 기한·통지·반려 요건을 모두 규정한다' },
          { label: '문서 최신성', weight: 0.23, detail: '2026년 개정본이며 상위 법령과 충돌이 없다' },
          { label: '용어 일치', weight: 0.15, detail: "'이송'이 법령 용어와 같다" },
        ],
        caveat: '고충민원·다수인 민원은 별도 절차가 있습니다. 해당 여부를 먼저 확인하십시오.',
      },
    },
  },
  {
    keywords: ['광고물', '계고', '옥외'],
    reply: {
      text: '허가 없이 표시했거나 허가 내용과 다른 광고물은 정비 대상입니다. 안전 기준 미달로 낙하 위험이 있으면 우선 계고하며, 현재 25건이 우선 계고 대상입니다.',
      sources: [
        fromRegulation('한성시 옥외광고물 조례 제9조'),
        fromRegulation('옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 법률 제3조'),
      ],
      confidence: 0.89,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '조례 조항 일치', weight: 0.5, detail: '조례 제9조가 우선 계고 요건을 정한다' },
          { label: '상위 법령 확인', weight: 0.27, detail: '허가·신고 의무가 법 제3조에 있다' },
          { label: '현재 점검 결과 참조', weight: 0.23, detail: '안전 미달 25건이라는 이번 분기 값을 인용했다' },
        ],
        caveat: '계고 후 시정되지 않으면 대집행 절차가 따로 있습니다. 행정대집행법을 확인하십시오.',
      },
    },
  },
  {
    keywords: ['현장 확인', '점검'],
    reply: {
      text: '현장 확인이 필요한 민원은 확인 일자와 확인자를 기록해야 합니다. 확인 없이 처리하면 사후 점검에서 사유를 소명해야 합니다.',
      sources: [fromDocument(GUIDE, 'doc-hsc-guide', '제5장 현장 확인')],
      confidence: 0.86,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '지침 조항 직접 일치', weight: 0.58, detail: '제5장이 기록 의무와 소명 책임을 규정한다' },
          { label: '점검 계획 참조', weight: 0.24, detail: '호우 대비 점검도 같은 기록 규칙을 따른다' },
          { label: '용어 일치', weight: 0.18, detail: "'현장 확인'이 지침 용어와 같다" },
        ],
        caveat: '2인 1조 확인이 필요한 유형이 따로 있습니다. 옥외광고물 점검이 그렇습니다.',
      },
    },
  },
  {
    keywords: ['개인정보', '제공'],
    reply: {
      text: '민원 처리에서 수집한 개인정보는 처리 목적 범위에서만 씁니다. 제3자 제공은 법령 근거나 동의가 있어야 하고, 통계 공표 시에는 비식별 조치를 거칩니다.',
      sources: [fromRegulation('한성시 개인정보 보호 지침 제14조')],
      confidence: 0.74,
      map: null,
      xai: {
        factors: [
          { label: '지침 조항 일치', weight: 0.45, detail: '제14조가 목적 외 이용·제공을 금지한다' },
          { label: '질문 범위 불확실', weight: 0.35, detail: '어떤 자료를 누구에게 주는지가 질문에 없어 일반 원칙으로 답했다' },
          { label: '개정일 확인', weight: 0.2, detail: '2022-09-15 개정본이며 이후 변경 이력은 확인하지 못했다' },
        ],
        caveat: '지침 개정이 3년 넘게 없었습니다. 상위 법령이 바뀌었을 수 있으니 원문을 확인하십시오.',
      },
      handoff: {
        agentLabel: '내규·규정 조회',
        reason: '조항 원문과 개정 이력까지 보려면 내규·규정 조회 에이전트를 쓰십시오.',
      },
    },
  },
  {
    keywords: ['행정동', '동별', '접수 현황'],
    reply: {
      text: '행정동별 인구 1천 명당 민원 접수는 아래와 같습니다. 강변동(18.4건)이 가장 많고, 새들동과 청산동은 집계값이 없습니다.',
      sources: [fromDocument('2026년 1분기 민원 처리 통계', 'doc-hsc-stats', '4. 지역별 편차')],
      confidence: 0.83,
      handoff: null,
      map: CIVIC_COMPLAINT_RATE,
      xai: {
        factors: [
          { label: '집계표 직접 참조', weight: 0.53, detail: '통계 4절의 지역별 편차를 그대로 옮겼다' },
          { label: '미집계 지역 표시', weight: 0.3, detail: '새들동·청산동은 값이 없다는 사실을 함께 말한다' },
          { label: '인구 대비 기준', weight: 0.17, detail: '절대 건수가 아니라 인구 1천 명당으로 잰다' },
        ],
        caveat: '평균은 값이 있는 10개 동의 평균입니다. 시 전체 평균이 아닙니다.',
      },
    },
  },
]

/** 매칭 실패 — 지어내지 않는다 */
export const CIVIC_CHAT_UNKNOWN: Omit<ChatMessage, 'id' | 'role'> = {
  text: '이 질문에 답할 근거를 사내 지침과 법령에서 찾지 못했습니다. 확실하지 않은 내용을 지어내지 않기 위해 답변을 비워 둡니다. 질문을 구체화하시거나 담당 부서에 문의하십시오.',
  sources: [],
  confidence: null,
  handoff: null,
  xai: null,
  map: null,
}

/** 보안 항목은 일부러 답할 수 없는 질문으로 뒀다 */
export const CIVIC_FAQ: FaqItem[] = [
  { category: 'standard', question: '소관이 아닌 민원은 어떻게 이송하나요?', hint: '이송 요건과 통지 기한을 처리지침으로' },
  { category: 'standard', question: '현장 확인은 무엇을 기록해야 하나요?', hint: '사진·계측·입회자까지 남겨야 할 것' },
  { category: 'labor', question: '처리 기한 연장은 어떻게 통지하나요?', hint: '연장 사유와 통지 방법·시점' },
  { category: 'quality', question: '옥외광고물 계고 기준이 어떻게 되나요?', hint: '위반 유형별 계고와 이행강제금 절차' },
  { category: 'quality', question: '개인정보를 제3자에게 줄 수 있나요?' },
  { category: 'security', question: '청사 출입증 재발급 절차가 어떻게 되나요?' },
  { category: 'system', question: '행정동별 접수 현황 보여줘' },
]
