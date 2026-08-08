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

export const HSC_ACTIVITY: AgentActivity = {
  usage: [
    { agentId: 'chatbot', runs: 24, favorite: true },
    { agentId: 'summary', runs: 11, favorite: false },
    { agentId: 'internalreg', runs: 9, favorite: false },
    { agentId: 'review', runs: 7, favorite: false },
    { agentId: 'report', runs: 6, favorite: false },
    { agentId: 'knowledge', runs: 5, favorite: false },
    { agentId: 'translate', runs: 4, favorite: false },
    { agentId: 'dbquery', runs: 4, favorite: false },
    { agentId: 'ocr', runs: 3, favorite: false },
    { agentId: 'meeting', runs: 3, favorite: false },
    { agentId: 'dataanalysis', runs: 2, favorite: false },
    { agentId: 'safety', runs: 2, favorite: false },
    { agentId: 'address', runs: 1, favorite: false },
  ],
  recent: [
    { id: 'r-1', agentId: 'summary', title: '민원 접수 내용 요약', detail: '장문 민원 3건', at: '오늘 09:40' },
    { id: 'r-2', agentId: 'internalreg', title: '옥외광고물 조례 조회', detail: '계고 기준 확인', at: '어제 15:12' },
    { id: 'r-3', agentId: 'report', title: '재난 상황보고 1보', detail: 'HSC-2026-063 생성', at: '어제 08:05' },
  ],
  hints: [
    {
      id: 'h-1',
      title: '법정 기한이 임박한 민원 6건',
      body: '처리 기한의 70%를 넘긴 민원이 있습니다. 회신 초안부터 잡으십시오.',
      agentId: 'dbquery',
      action: '민원 현황 조회',
    },
    {
      id: 'h-2',
      title: '강변동 호우 상황 보고가 열려 있습니다',
      body: '1보 이후 후속 보고가 작성되지 않았습니다.',
      agentId: 'report',
      action: '상황보고 작성',
    },
  ],
}
