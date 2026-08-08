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

export const SUH_ACTIVITY: AgentActivity = {
  usage: [
    { agentId: 'chatbot', runs: 16, favorite: true },
    { agentId: 'review', runs: 12, favorite: false },
    { agentId: 'dbquery', runs: 9, favorite: false },
    { agentId: 'summary', runs: 8, favorite: false },
    { agentId: 'internalreg', runs: 6, favorite: false },
    { agentId: 'report', runs: 5, favorite: false },
    { agentId: 'knowledge', runs: 4, favorite: false },
    { agentId: 'ocr', runs: 4, favorite: false },
    { agentId: 'dataanalysis', runs: 3, favorite: false },
    { agentId: 'meeting', runs: 2, favorite: false },
    { agentId: 'address', runs: 2, favorite: false },
    { agentId: 'translate', runs: 1, favorite: false },
    { agentId: 'safety', runs: 1, favorite: false },
  ],
  recent: [
    { id: 'r-1', agentId: 'review', title: '청구 건 사전 점검', detail: '342건 중 위험 18건', at: '오늘 11:05' },
    { id: 'r-2', agentId: 'dbquery', title: '응급의료센터 가동률 조회', detail: '9개 센터', at: '오늘 08:20' },
    { id: 'r-3', agentId: 'summary', title: '의무기록 요약', detail: '입원 경과 2건', at: '어제 16:30' },
  ],
  hints: [
    {
      id: 'h-1',
      title: '삭감 위험 18건이 아직 소명되지 않았습니다',
      body: '사전 점검에서 걸린 청구 건의 소명 자료가 준비되지 않았습니다.',
      agentId: 'review',
      action: '사전 점검 열기',
    },
    {
      id: 'h-2',
      title: '응급의료센터 가동률이 임계에 있습니다',
      body: '92%로 관리 기준 90%를 넘겼습니다. 센터별 현황을 확인하십시오.',
      agentId: 'dbquery',
      action: '센터 현황 조회',
    },
  ],
}
