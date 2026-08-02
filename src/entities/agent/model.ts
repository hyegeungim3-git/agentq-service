/**
 * 에이전트 카탈로그.
 *
 * 13종을 옮기는 중이므로 **구현 상태를 데이터로 들고 있는다.**
 * 아직 안 만든 것을 목록에서 빼면 "원래 없던 기능"처럼 보이고,
 * 그냥 넣어 두면 눌렀을 때 아무 일도 안 나는 죽은 버튼이 된다.
 * 둘 다 피하려고 상태를 명시한다 — 화면이 '준비 중'으로 표시하고 비활성화한다.
 */

export type AgentId =
  | 'chatbot'
  | 'report'
  | 'meeting'
  | 'knowledge'
  | 'internalreg'
  | 'ocr'
  | 'dbquery'
  | 'address'
  | 'dataanalysis'
  | 'summary'
  | 'translate'
  | 'review'
  | 'safety'

export type AgentStatus = 'ready' | 'planned'

export type AgentDefinition = {
  id: AgentId
  name: string
  /** 카드에 붙는 한 줄 — 무엇을 해 주는가 */
  desc: string
  status: AgentStatus
}

/** 이전 데모의 13종을 그대로 승계한다. 순서는 허브 노출 순서다. */
export const AGENTS: AgentDefinition[] = [
  { id: 'summary', name: '문서 요약', desc: '장문 문서를 방식별로 구조화해 요약합니다.', status: 'ready' },
  { id: 'translate', name: '수출 문서 번역', desc: '용어집을 적용해 번역하고 역번역으로 검증합니다.', status: 'ready' },
  { id: 'review', name: '문서 사전 검토', desc: '기안문을 사규와 대조해 위반 소지를 검토합니다.', status: 'ready' },
  { id: 'chatbot', name: '업무 챗봇', desc: '사내 규정·지침을 근거와 함께 답변합니다.', status: 'planned' },
  { id: 'report', name: '표준 보고서 작성', desc: '실적 데이터를 표준 양식 보고서로 작성합니다.', status: 'ready' },
  { id: 'meeting', name: '회의록 작성', desc: '녹음을 발언자 구분 회의록으로 정리합니다.', status: 'ready' },
  { id: 'knowledge', name: '지식 검색', desc: '축적 도면·문서를 온톨로지로 검색합니다.', status: 'ready' },
  { id: 'internalreg', name: '내규·규정 조회', desc: '사내 규정을 조항 근거와 함께 조회합니다.', status: 'ready' },
  { id: 'ocr', name: '문서 인식(OCR)', desc: '스캔 문서를 텍스트로 변환하고 개인정보를 가립니다.', status: 'ready' },
  { id: 'dbquery', name: '데이터 조회', desc: '자연어를 SQL로 바꿔 실적·재고를 조회합니다.', status: 'ready' },
  { id: 'address', name: '기준정보 표준화', desc: '설비 태그·기준정보를 표준 체계로 매핑합니다.', status: 'planned' },
  { id: 'dataanalysis', name: '데이터 분석', desc: '공정 데이터를 차트·통계로 분석합니다.', status: 'ready' },
  { id: 'safety', name: '안전관리계획 수립', desc: '작업 위험요인을 평가해 관리계획을 만듭니다.', status: 'ready' },
]

export const READY_AGENTS = AGENTS.filter((a) => a.status === 'ready')

export function findAgent(id: string): AgentDefinition | undefined {
  return AGENTS.find((a) => a.id === id)
}

/** 이식 진척 — 화면에 그대로 보여준다. 남은 양을 감추지 않는다. */
export function migrationProgress(): { ready: number; total: number } {
  return { ready: READY_AGENTS.length, total: AGENTS.length }
}
