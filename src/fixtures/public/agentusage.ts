/**
 * 에이전트 사용 현황 fixture.
 *
 * ⚠️ **서버가 센 수가 아니다**(D-014). 원본 허브의 실행 횟수·순위·활동 목록 자리를
 * 채우는 값이며, 서버가 붙으면 이용 통계에서 온다.
 *
 * 발주처마다 다르게 둔다 — 제조는 OCR·데이터 조회가 많고, 의료는 사전 검토가 많다.
 * 어디서나 같은 수가 나오면 '내 조직의 화면'이 아니게 된다.
 */
import type { AgentActivity } from '@entities/agentusage/model'

export const REB_ACTIVITY: AgentActivity = {
  usage: [
    { agentId: 'chatbot', runs: 18, favorite: true },
    { agentId: 'knowledge', runs: 9, favorite: false },
    { agentId: 'internalreg', runs: 8, favorite: false },
    { agentId: 'dbquery', runs: 7, favorite: false },
    { agentId: 'report', runs: 6, favorite: false },
    { agentId: 'review', runs: 5, favorite: false },
    { agentId: 'ocr', runs: 4, favorite: false },
    { agentId: 'summary', runs: 4, favorite: false },
    { agentId: 'meeting', runs: 3, favorite: false },
    { agentId: 'translate', runs: 3, favorite: false },
    { agentId: 'dataanalysis', runs: 2, favorite: false },
    { agentId: 'address', runs: 2, favorite: false },
    { agentId: 'safety', runs: 1, favorite: false },
  ],
  recent: [
    { id: 'r-1', agentId: 'knowledge', title: '표준지 조사 기준 검색', detail: '조사지침 5건', at: '오늘 10:15' },
    { id: 'r-2', agentId: 'report', title: '주간 실적 보고서 초안', detail: 'KREA-2026-026 생성', at: '어제 17:02' },
    { id: 'r-3', agentId: 'dbquery', title: '실거래 신고 조회', detail: '1,842건 중 의심 8건', at: '어제 11:20' },
  ],
  hints: [
    {
      id: 'h-1',
      title: '이의신청 회신 기한이 12일 남았습니다',
      body: '접수된 이의신청의 검토 의견서가 아직 작성되지 않았습니다.',
      agentId: 'review',
      action: '사전 검토 시작',
    },
    {
      id: 'h-2',
      title: '실거래 의심 거래 8건 미검토',
      body: '시세 괴리율 30%를 넘은 신고 건이 검토를 기다립니다.',
      agentId: 'dbquery',
      action: '실거래 조회',
    },
  ],
}
