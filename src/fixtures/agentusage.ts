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

export const HBP_ACTIVITY: AgentActivity = {
  usage: [
    { agentId: 'chatbot', runs: 21, favorite: true },
    { agentId: 'dbquery', runs: 12, favorite: false },
    { agentId: 'ocr', runs: 11, favorite: false },
    { agentId: 'report', runs: 7, favorite: false },
    { agentId: 'meeting', runs: 6, favorite: false },
    { agentId: 'summary', runs: 5, favorite: false },
    { agentId: 'knowledge', runs: 5, favorite: false },
    { agentId: 'dataanalysis', runs: 4, favorite: false },
    { agentId: 'safety', runs: 3, favorite: false },
    { agentId: 'review', runs: 3, favorite: false },
    { agentId: 'internalreg', runs: 2, favorite: false },
    { agentId: 'translate', runs: 2, favorite: false },
    { agentId: 'address', runs: 1, favorite: false },
  ],
  recent: [
    { id: 'r-1', agentId: 'ocr', title: '검사성적서 인식', detail: 'SPCC-2211 스캔본 1건', at: '오늘 14:32' },
    { id: 'r-2', agentId: 'dbquery', title: 'MES 불량률 조회', detail: '7월 3주 로트 12건', at: '오늘 10:15' },
    { id: 'r-3', agentId: 'dataanalysis', title: '침탄로 온도 편차 분석', detail: '존별 편차 ±8℃ 확인', at: '어제 16:44' },
  ],
  hints: [
    {
      id: 'h-1',
      title: 'PRS-C03 정비 지시가 아직 안 닫혔습니다',
      body: '발행 6일째 작업 중입니다. 진동 추이를 함께 보고 조치 상태를 확인하십시오.',
      agentId: 'dbquery',
      action: '설비 이력 조회',
    },
    {
      id: 'h-2',
      title: '미처리 회의 녹음 1건',
      body: '2026-07-20 공정회의 녹음이 아직 회의록으로 정리되지 않았습니다.',
      agentId: 'meeting',
      action: '회의록 작성 시작',
    },
  ],
}
