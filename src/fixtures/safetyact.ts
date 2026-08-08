/**
 * 중대재해처벌법 대응 fixture.
 *
 * 세계관은 한빛정밀이다. 위험성평가는 다른 화면의 사건과 이어진다 —
 * 예지보전이 잡은 진동 알람이 정비 지시로 가고, 그 정비 작업이 여기 위험성평가로 온다.
 *
 * **'이행'인데 갱신 주기를 넘긴 것을 넣었다.** 전부 최신이면 그것을 드러내는 화면이
 * 죽은 코드가 된다. 제6호 전문인력 배치는 인원 변동이 잦아 반기(182일)로 정해 두고도
 * 초록색으로 표시된 채 9개월 가까이 그대로다 — 표만 보면 다 이행이라 이런 것이 실제로 위험하다.
 *
 * 주기는 호마다 다르다. 경영방침은 연 1회(1월 공표라 7개월 지났어도 정상),
 * 위험성평가·의견 청취는 상시(90일)라 자동 축적이 멈추면 바로 드러난다.
 */
import type { RiskAssessment, SafetyDuty, SafetyTraining } from '@entities/safetyact/model'

export const SAFETY_DUTIES: SafetyDuty[] = [
  { id: 'sd-1', cycleDays: 365, clause: '제1호', name: '안전보건 목표·경영방침 설정', status: 'met', evidence: '2026년 안전보건 경영방침 공표문', evidenceAt: '2026-01-05', owner: '경영지원팀', auto: false },
  { id: 'sd-2', cycleDays: 365, clause: '제2호', name: '안전보건 전담 조직 구성', status: 'met', evidence: '전담 조직 지정서', evidenceAt: '2026-01-10', owner: '경영지원팀', auto: false },
  { id: 'sd-3', cycleDays: 90, clause: '제3호', name: '유해·위험요인 확인·개선 절차', status: 'met', evidence: '위험성평가 실시 이력', evidenceAt: '2026-07-28', owner: '안전보건팀', auto: true },
  { id: 'sd-4', cycleDays: 365, clause: '제4호', name: '안전보건 예산 편성·집행', status: 'met', evidence: '2026년 안전보건 예산 집행 내역', evidenceAt: '2026-06-30', owner: '경영지원팀', auto: false },
  { id: 'sd-5', cycleDays: 182, clause: '제5호', name: '안전보건관리책임자 권한·평가', status: 'attention', evidence: '반기 평가 미실시 — 상반기 평가 예정', evidenceAt: '2025-12-20', owner: '경영지원팀', auto: false },
  { id: 'sd-6', cycleDays: 182, clause: '제6호', name: '안전보건 전문인력 배치', status: 'met', evidence: '전문인력 배치 현황표', evidenceAt: '2025-11-14', owner: '경영지원팀', auto: false },
  { id: 'sd-7', cycleDays: 90, clause: '제7호', name: '종사자 의견 청취 절차', status: 'met', evidence: '의견 접수·처리 이력', evidenceAt: '2026-07-30', owner: '안전보건팀', auto: true },
  { id: 'sd-8', cycleDays: 365, clause: '제8호', name: '중대재해 대응 매뉴얼·훈련', status: 'met', evidence: '비상 대응 매뉴얼 및 훈련 기록', evidenceAt: '2026-02-14', owner: '안전보건팀', auto: false },
  { id: 'sd-9', cycleDays: 365, clause: '제9호', name: '도급·용역·위탁 안전 평가기준', status: 'attention', evidence: '평가 기준은 있으나 수급업체 1개사 미평가', evidenceAt: '2026-01-28', owner: '구매팀', auto: false },
]

/**
 * 위험성평가 이력.
 *
 * **조치가 남은 건을 넣었다.** 평가를 했다는 것과 위험이 없어진 것은 다르다.
 */
export const RISK_ASSESSMENTS: RiskAssessment[] = [
  { id: 'ra-1', task: '프레스 3호기 정기 정비 작업', docNo: 'HBP-안전-2026-031', assessedOn: '2026-07-28', by: '오세진 팀장', risks: 3, actionsDone: 3 },
  { id: 'ra-2', task: '침탄로 상부 고소 작업', docNo: 'HBP-안전-2026-027', assessedOn: '2026-07-14', by: '오세진 팀장', risks: 4, actionsDone: 3 },
  { id: 'ra-3', task: '수급업체 야간 반입 작업', docNo: 'HBP-안전-2026-024', assessedOn: '2026-06-19', by: '정하늘', risks: 2, actionsDone: 1 },
]

export const SAFETY_TRAININGS: SafetyTraining[] = [
  { id: 'st-1', name: '정기 안전보건교육 (3분기)', target: '전 종사자', done: 142, total: 150, heldOn: '2026-07-20' },
  { id: 'st-2', name: '신규 채용자 안전교육', target: '신규 입사자', done: 8, total: 8, heldOn: '2026-07-05' },
  { id: 'st-3', name: '수급업체 작업 전 안전교육', target: '협력사 작업자', done: 11, total: 14, heldOn: '2026-06-22' },
]
