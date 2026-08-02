/**
 * 챗봇 fixture.
 *
 * 세 종류를 준비했다:
 *   ① 근거가 확실한 답 — 출처와 높은 신뢰도
 *   ② 근거는 있으나 확신이 낮은 답 — '확인 권장' 표시
 *   ③ 모르는 질문 — 지어내지 않고 모른다고 답한다
 *
 * ③이 없으면 '모를 때 어떻게 하는가'를 보여 주는 화면이 죽은 코드가 된다.
 */
import type { ChatMessage } from '@entities/chat/model'

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
        { title: '프레스 작업표준 SOP-PR-011', locator: '제4장 금형 수명 관리' },
        { title: '프레스 작업표준 SOP-PR-011', locator: '제3장 금형 교체' },
      ],
      confidence: 0.94,
      handoff: null,
    },
  },
  {
    keywords: ['진동', '알람', 'PRS'],
    reply: {
      text: '진동 RMS가 관리 기준 3.5mm/s를 넘으면 예지보전 알람이 발생합니다. 알람이 뜨면 운전을 계속하지 말고 보전팀 진단을 받아야 하며, 연속 초과 시 계획정지에 편성합니다. 현재 PRS-C03이 4.2mm/s로 기준을 넘고 있습니다.',
      sources: [{ title: '프레스 작업표준 SOP-PR-011', locator: '제5장 이상 대응' }],
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
      sources: [{ title: '취업규칙', locator: '제23조 제2항' }],
      confidence: 0.72,
      handoff: {
        agentLabel: '내규·규정 조회',
        reason: '조항 원문과 개정일까지 확인하려면 규정 조회 에이전트를 쓰십시오.',
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
