/**
 * 안전관리계획 fixture.
 *
 * 대책을 세워도 잔여 위험이 남는다는 것을 명시한다. 잔여 위험을 비워 두면
 * '대책을 세웠으니 안전하다'로 읽히고, 그게 현장에서 가장 위험한 착각이다.
 *
 * 작업 인원이 2인 미만이면 성립하지 않는 대책을 하나 넣었다 —
 * 인원 설정이 결과를 실제로 바꾸는지 확인할 수 있어야 한다.
 */
import type { Hazard } from '@entities/safety/model'

/** 2인 이상일 때만 성립하는 대책이 포함된 목록 */
export const HAZARDS_CREW_2: Hazard[] = [
  {
    id: 'h-1',
    step: '금형 반입·크레인 이동',
    cause: '인양물 낙하 — 슬링 체결 불량',
    frequency: 2,
    severity: 5,
    control: '2인 1조로 체결 상태 상호 확인, 크레인 작업 구간 통제선 설치, 인양 경로 아래 출입 금지',
    residual: '통제선 밖 통행자에 대한 위험은 남는다. 작업 시간대를 공지한다.',
  },
  {
    id: 'h-2',
    step: '금형 고정·볼트 체결',
    cause: '슬라이드 하강 — 안전 플러그 미체결',
    frequency: 2,
    severity: 5,
    control: '안전 플러그 체결 후 전원 차단 확인, 체결 상태를 2인이 교차 확인',
    residual: '전원 차단 확인을 육안에 의존한다. 인터록 도입 전까지 잔여 위험이 있다.',
  },
  {
    id: 'h-3',
    step: '초품 검사',
    cause: '버(burr)에 의한 열상',
    frequency: 4,
    severity: 2,
    control: '내절창 장갑 착용, 검사대에서만 취급',
    residual: '장갑 착용 여부를 작업자 판단에 맡긴다.',
  },
  {
    id: 'h-4',
    step: '금형 청소',
    cause: '절삭유 접촉 — 피부 자극',
    frequency: 3,
    severity: 1,
    control: '내유성 장갑 착용, 환기 가동',
    residual: '장시간 반복 접촉에 의한 만성 영향은 관리 대상으로 남는다.',
  },
]

/** 1인 작업 — 상호 확인이 성립하지 않아 대책과 잔여 위험이 달라진다 */
export const HAZARDS_CREW_1: Hazard[] = HAZARDS_CREW_2.map((h) => {
  if (h.id === 'h-1' || h.id === 'h-2') {
    return {
      ...h,
      // 상호 확인이 빠지면 빈도가 올라간다
      frequency: h.frequency + 1,
      control: h.control.replace(/2인 1조로 체결 상태 상호 확인, /, '').replace(/, 체결 상태를 2인이 교차 확인/, ''),
      residual: `${h.residual} 1인 작업이라 상호 확인이 불가능하다 — 2인 배치를 권고한다.`,
    }
  }
  return h
})

export const SAFETY_REFERENCES: string[] = [
  '산업안전보건법 제36조 (위험성평가의 실시)',
  '산업안전보건기준에 관한 규칙 제103조 (프레스 등의 방호장치)',
  '프레스 작업표준 SOP-PR-011 제3장 (금형 교체)',
  '안전보건관리규정 제17조 (중량물 취급)',
]
