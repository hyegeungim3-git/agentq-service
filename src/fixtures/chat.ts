/**
 * 챗봇 fixture.
 *
 * 세 종류를 준비했다:
 *   ① 근거가 확실한 답 — 출처와 높은 신뢰도
 *   ② 근거는 있으나 확신이 낮은 답 — '확인 권장' 표시
 *   ③ 모르는 질문 — 지어내지 않고 모른다고 답한다
 *
 * ③이 없으면 '모를 때 어떻게 하는가'를 보여 주는 화면이 죽은 코드가 된다.
 *
 * ⚠️ 인용 원문은 여기에 다시 적지 않고 **원 소유자에게서 가져온다** —
 * 작업표준은 문서 fixture의 본문에서, 규정은 내규 조회 fixture의 조항에서.
 * 같은 조항을 두 화면이 다르게 인용하면 어느 쪽이 맞는지 알 수 없다.
 */
import type { ChatMessage, ChatSource, FaqItem } from '@entities/chat/model'
import { DOCUMENTS } from '@fixtures/documents'
import { REGULATION_ENTRIES } from '@fixtures/regulation'

/** 문서 본문에서 '제N장 …' 단락을 뽑는다. 못 찾으면 null */
export function findChapter(documentId: string, heading: string): string | null {
  const doc = DOCUMENTS.find((d) => d.id === documentId)
  if (!doc) return null
  const blocks = doc.text.split(/\n\s*\n/)
  const hit = blocks.find((b) => b.startsWith(heading))
  if (!hit) return null
  return hit.slice(heading.length).trim()
}

/** 내규 조회가 쓰는 조항 원문을 그대로 가져온다. 못 찾으면 null */
export function findClause(clause: string): { text: string; revisedOn: string } | null {
  for (const e of REGULATION_ENTRIES) {
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

const SOP = '프레스 작업표준 SOP-PR-011'

export type ChatEntry = {
  keywords: string[]
  reply: Omit<ChatMessage, 'id' | 'role'>
}

export const CHAT_ENTRIES: ChatEntry[] = [
  {
    keywords: ['금형', '교체', '주기'],
    reply: {
      text: '금형 교체 기준은 타수 50만 타입니다. 타수에 도달하지 않았더라도 버 발생이 관리 기준을 넘으면 교체합니다. 교체는 2인 1조로 수행하고 교체 후 초품 검사를 실시합니다.',
      sources: [
        fromDocument(SOP, 'doc-press-sop', '제4장 금형 수명 관리'),
        fromDocument(SOP, 'doc-press-sop', '제3장 금형 교체'),
      ],
      confidence: 0.94,
      handoff: null,
    },
  },
  {
    keywords: ['진동', '알람', 'PRS'],
    reply: {
      text: '진동 RMS가 관리 기준 3.5mm/s를 넘으면 예지보전 알람이 발생합니다. 알람이 뜨면 운전을 계속하지 말고 보전팀 진단을 받아야 하며, 연속 초과 시 계획정지에 편성합니다. 현재 PRS-C03이 4.2mm/s로 기준을 넘고 있습니다.',
      sources: [fromDocument(SOP, 'doc-press-sop', '제5장 이상 대응')],
      confidence: 0.91,
      handoff: {
        agentLabel: '데이터 조회',
        reason: '설비별 실측값을 표로 확인하려면 데이터 조회 에이전트가 더 정확합니다.',
      },
    },
  },
  {
    keywords: ['출장', '여비'],
    reply: {
      text: '국내 출장 여비는 일 60,000원 기준 실비 정산입니다. 기준액을 초과하려면 사전에 부서장 승인이 필요합니다.',
      sources: [fromRegulation('취업규칙 제23조 제2항')],
      confidence: 0.72,
      handoff: {
        agentLabel: '내규·규정 조회',
        reason: '조항 원문과 개정일까지 확인하려면 규정 조회 에이전트를 쓰십시오.',
      },
    },
  },
  {
    keywords: ['초품'],
    reply: {
      text: '초품 검사는 금형 교체 직후에 실시합니다. 교체는 2인 1조로 수행하며 크레인 작업 구간에는 통제선을 설치합니다. 검사 결과는 설비 대장에 기록합니다.',
      sources: [fromDocument(SOP, 'doc-press-sop', '제3장 금형 교체')],
      confidence: 0.89,
      handoff: null,
    },
  },
  {
    keywords: ['수입검사', '판정'],
    reply: {
      text: '수입검사는 경도 하한 58.0 HRC, 두께 편차 ±0.05mm를 판정 기준으로 합니다. 기준에 근접하거나 부대 조건이 걸리면 조건부 합격으로 처리하고 사유를 성적서에 남깁니다.',
      sources: [
        {
          title: '수입검사성적서 SPCC-2211',
          locator: '판정 근거',
          passage:
            '시험편 경도는 58.4 HRC로 규격 하한 58.0 HRC에 근접하였다. 침탄 열처리 후단존 온도 편차가 관리 한계를 초과하여 조건부 합격으로 판정하였다.',
          revisedOn: null,
        },
      ],
      confidence: 0.78,
      handoff: {
        agentLabel: '문서 인식(OCR)',
        reason: '성적서 원본의 수치를 줄 단위로 확인하려면 OCR 에이전트를 쓰십시오.',
      },
    },
  },
]

/** 매칭 실패 — 지어내지 않는다 */
export const CHAT_UNKNOWN: Omit<ChatMessage, 'id' | 'role'> = {
  text: '이 질문에 답할 근거를 사내 문서에서 찾지 못했습니다. 확실하지 않은 내용을 지어내지 않기 위해 답변을 비워 둡니다. 질문을 구체화하시거나 담당 부서에 문의하십시오.',
  sources: [],
  confidence: null,
  handoff: null,
}

/**
 * 자주 묻는 질문.
 *
 * 보안 항목은 일부러 답할 수 없는 질문으로 뒀다. FAQ에 있다고 다 답할 수 있는 것은
 * 아니고, 지식베이스에 없으면 없다고 말해야 한다 — 그 경로가 목록에서도 닿아야 한다.
 */
export const FAQ_ITEMS: FaqItem[] = [
  { category: 'standard', question: '금형 교체 주기가 어떻게 되나요?' },
  { category: 'standard', question: '초품 검사는 언제 실시하나요?' },
  { category: 'labor', question: '출장 여비 기준 알려줘' },
  { category: 'quality', question: '수입검사 판정 기준이 무엇인가요?' },
  { category: 'security', question: '도면 등 기밀 기술자료는 어떻게 처리하나요?' },
  { category: 'system', question: '진동 알람이 뜨면 어떻게 하나요?' },
]
