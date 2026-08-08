/**
 * 의료(새빛대학교병원) 챗봇.
 *
 * 앞의 세 팩과 같은 세 종류를 갖춘다 — 확실한 답 / 확신이 낮은 답 / 모르는 질문.
 *
 * ⚠️ 인용 원문은 원 소유자에게서 가져온다. 지침은 문서 본문에서, 법령은 조항에서.
 * ⚠️ 키워드는 좁게 둔다 — 앞선 팩에서 넓은 말이 다른 답을 가로챈 적이 있다.
 */
import type { ChatMessage, ChatSource, FaqItem } from '@entities/chat/model'
import type { ChatEntry } from '../chat'
import { MEDICAL_DOCUMENTS } from './documents'
import { MEDICAL_REGULATIONS } from './regulation'
import { MEDICAL_BED_USAGE } from './mapintel'

function findChapter(documentId: string, heading: string): string | null {
  const doc = MEDICAL_DOCUMENTS.find((d) => d.id === documentId)
  if (!doc) return null
  const hit = doc.text.split(/\n\s*\n/).find((b) => b.startsWith(heading))
  return hit ? hit.slice(heading.length).trim() : null
}

function findClause(clause: string): { text: string; revisedOn: string } | null {
  for (const e of MEDICAL_REGULATIONS) {
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

const GUIDE = '진료비 청구 심사지침'

export const MEDICAL_CHAT: ChatEntry[] = [
  {
    keywords: ['사전점검', '보류'],
    reply: {
      text: '청구 전에 고가 처치·재료대, 급여 기준 초과 투여, 진료기록 근거 미비 세 가지를 점검합니다. 근거가 확인되지 않으면 보류하고 진료과에 확인을 요청합니다. 현재 보류 342건 중 18건이 회신 대기입니다.',
      sources: [fromDocument(GUIDE, 'doc-suh-guide', '제2장 사전점검')],
      confidence: 0.93,
      map: null,
      xai: {
        factors: [
          { label: '지침 조항 직접 일치', weight: 0.58, detail: '제2장이 점검 대상과 보류 절차를 규정한다' },
          { label: '현재 점검 현황 참조', weight: 0.27, detail: '보류 342건 중 회신 대기 18건을 함께 인용했다' },
          { label: '용어 일치', weight: 0.15, detail: "'사전점검'이 원내 표준 용어와 같다" },
        ],
        caveat: '인용한 18건은 마지막 집계값입니다. 건별 상태는 조회로 확인하십시오.',
      },
      handoff: {
        agentLabel: '데이터 조회',
        reason: '보류 건을 진료과·사유별로 보려면 데이터 조회 에이전트가 더 정확합니다.',
      },
    },
  },
  {
    keywords: ['진료기록', '근거'],
    reply: {
      text: '급여 기준을 초과해 산정하려면 의학적 필요성을 진료기록에 남겨야 합니다. 기록이 없으면 심사에서 조정되고, 사후 이의신청으로 회복하기 어렵습니다.',
      sources: [
        fromRegulation('진료비 청구 심사지침 제3장'),
        fromRegulation('국민건강보험 요양급여의 기준에 관한 규칙 제5조'),
      ],
      confidence: 0.91,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '지침·규칙 조항 일치', weight: 0.55, detail: '지침 제3장이 기재 의무를, 규칙 제5조가 급여 원칙을 정한다' },
          { label: '반복 조정 이력 참조', weight: 0.28, detail: '기록 근거 미비가 조정 항목 1위라는 사실을 반영했다' },
          { label: '용어 일치', weight: 0.17, detail: "'진료기록'이 법령 용어와 같다" },
        ],
        caveat: '항목별 급여 기준은 고시 개정이 잦습니다. 산정 전에 최신 고시를 확인하십시오.',
      },
    },
  },
  {
    keywords: ['이의신청', '조정'],
    reply: {
      text: '조정 통보를 받으면 30일 이내에 이의신청 여부를 결정합니다. 근거 자료를 갖춘 건만 제기하고, 반복 조정 항목은 청구 전 점검 항목에 추가합니다.',
      sources: [fromRegulation('진료비 청구 심사지침 제4장')],
      confidence: 0.88,
      map: null,
      handoff: null,
      xai: {
        factors: [
          { label: '지침 조항 일치', weight: 0.6, detail: '제4장이 기한과 처리 방식을 함께 정한다' },
          { label: '현재 조정률 참조', weight: 0.24, detail: '분기 조정률 0.71%를 배경으로 삼았다' },
          { label: '용어 일치', weight: 0.16, detail: "'이의신청'이 법령 용어와 같다" },
        ],
        caveat: '이의신청 기한은 통보일 기준입니다. 원내 결재 기간을 감안해 일정을 잡으십시오.',
      },
    },
  },
  {
    keywords: ['응급', '산정'],
    reply: {
      text: '응급 진료는 응급증상 해당 여부에 따라 산정 기준이 달라집니다. 판단 근거를 진료기록에 남겨야 하며, 기준은 응급의료에 관한 법률을 따릅니다.',
      sources: [
        fromRegulation('응급의료에 관한 법률 제2조'),
        fromDocument(GUIDE, 'doc-suh-guide', '제5장 응급 진료 청구'),
      ],
      confidence: 0.79,
      map: null,
      xai: {
        factors: [
          { label: '법령 정의 일치', weight: 0.47, detail: '법 제2조가 응급환자 정의를 규정한다' },
          { label: '질문 범위 불확실', weight: 0.34, detail: '어떤 처치·시간대인지가 질문에 없어 일반 기준으로 답했다' },
          { label: '지침 조항 확인', weight: 0.19, detail: '지침 제5장이 근거 기재를 요구한다' },
        ],
        caveat: '응급증상 세부 목록은 시행규칙 별표에 있습니다. 개별 판단은 원문을 확인하십시오.',
      },
      handoff: {
        agentLabel: '내규·규정 조회',
        reason: '조항 원문과 개정 이력까지 보려면 내규·규정 조회 에이전트를 쓰십시오.',
      },
    },
  },
  {
    keywords: ['민감정보', '연구'],
    reply: {
      text: '진료 정보는 민감정보라 별도 동의 없이 목적 외로 쓸 수 없습니다. 연구·통계 목적이면 가명처리와 심의를 거쳐야 하고, 원자료 반출은 금지됩니다.',
      sources: [fromRegulation('원내 개인정보 보호지침 제19조')],
      confidence: 0.73,
      map: null,
      xai: {
        factors: [
          { label: '지침 조항 일치', weight: 0.44, detail: '제19조가 목적 외 이용·제공을 금지한다' },
          { label: '질문 범위 불확실', weight: 0.36, detail: '어떤 자료를 어디에 쓰는지가 질문에 없어 일반 원칙으로 답했다' },
          { label: '개정일 확인', weight: 0.2, detail: '2022-11-30 개정본이며 이후 변경 이력은 확인하지 못했다' },
        ],
        caveat: '지침 개정이 3년 넘게 없었습니다. 상위 법령이 바뀌었을 수 있으니 원문을 확인하십시오.',
      },
      handoff: null,
    },
  },
  {
    keywords: ['진료과', '병상', '가동률'],
    reply: {
      text: '진료과별 병상 가동률은 아래와 같습니다. 응급의료센터(92.1%)가 가장 높고, 재활의학과와 주간진료센터는 같은 지표로 재지 않습니다.',
      sources: [fromDocument('2026년 1분기 적정성 평가 결과', 'doc-suh-quality', '3. 병상 운영')],
      confidence: 0.84,
      handoff: null,
      map: MEDICAL_BED_USAGE,
      xai: {
        factors: [
          { label: '집계표 직접 참조', weight: 0.55, detail: '평가 결과 3절의 병상 운영 집계를 그대로 옮겼다' },
          { label: '미집계 진료과 표시', weight: 0.28, detail: '재활의학과·주간진료센터는 값이 없다는 사실을 함께 말한다' },
          { label: '기간 명시', weight: 0.17, detail: '2026년 1분기 기준이다' },
        ],
        caveat: '평균은 값이 있는 7개 진료과의 평균입니다. 병원 전체 평균이 아닙니다.',
      },
    },
  },
]

/** 매칭 실패 — 지어내지 않는다 */
export const MEDICAL_CHAT_UNKNOWN: Omit<ChatMessage, 'id' | 'role'> = {
  text: '이 질문에 답할 근거를 원내 지침과 법령에서 찾지 못했습니다. 확실하지 않은 내용을 지어내지 않기 위해 답변을 비워 둡니다. 질문을 구체화하시거나 담당 부서에 문의하십시오.',
  sources: [],
  confidence: null,
  handoff: null,
  xai: null,
  map: null,
}

/** 보안 항목은 일부러 답할 수 없는 질문으로 뒀다 */
export const MEDICAL_FAQ: FaqItem[] = [
  { category: 'standard', question: '사전점검에서 무엇을 보나요?', hint: '삭감 위험이 높은 항목과 확인 순서' },
  { category: 'standard', question: '진료기록 근거는 왜 필요한가요?', hint: '심사에서 요구하는 기록의 범위' },
  { category: 'labor', question: '조정 통보를 받으면 언제까지 이의신청하나요?', hint: '이의신청 기한과 준비 서류' },
  { category: 'quality', question: '응급 진료 산정 기준이 어떻게 되나요?', hint: '응급도 판정과 가산 적용 요건' },
  { category: 'quality', question: '연구 목적으로 민감정보를 쓸 수 있나요?' },
  { category: 'security', question: '주차 정기권 신청은 어디서 하나요?' },
  { category: 'system', question: '진료과별 병상 가동률 보여줘' },
]
