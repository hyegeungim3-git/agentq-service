/**
 * 스캔 등록 코드 fixture.
 *
 * 세계관은 한빛정밀이다. 코드는 다른 화면에 나오는 것과 같은 대상을 가리킨다 —
 * PRS-C03(예지보전 알람), 침탄로 2호기, 정비지시서 HBP-보전-2026-102.
 *
 * 찍는 이유가 곧 질문이라, 대상마다 물어볼 문장을 함께 둔다.
 */
import type { ScanTarget } from '@entities/scan/model'

export const SCAN_TARGETS: ScanTarget[] = [
  { code: 'PRS-C03', kind: 'equipment', name: '프레스 3호기', ask: 'PRS-C03 진동 추이와 관리 기준 알려줘' },
  { code: 'CBF-02', kind: 'equipment', name: '침탄로 2호기', ask: '침탄로 2호기 존별 온도 편차 알려줘' },
  { code: 'LOT-26Q3-118', kind: 'lot', name: '7월 3주 크랭크축 로트', ask: 'LOT-26Q3-118 검사 결과와 불량 원인 알려줘' },
  { code: 'HBP-보전-2026-102', kind: 'workOrder', name: 'PRS-C03 베어링 점검 지시', ask: 'HBP-보전-2026-102 작업지시 진행 상태 알려줘' },
  { code: 'MAT-SCM440-08', kind: 'material', name: 'SCM440 원소재 08번 팔레트', ask: 'MAT-SCM440-08 입고 성적서와 사용 로트 알려줘' },
]
