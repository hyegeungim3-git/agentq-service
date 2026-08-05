/**
 * 공공(한국부동산원) 현장조사 안전관리계획.
 *
 * 제조가 '프레스 금형 교체'라면 여기는 **표준지 현장조사**다. 조사자가 실제로
 * 마주치는 위험을 옮겼다 — 도로변 조사, 경사지 진입, 대인 마찰, 폭염.
 *
 * 제조 팩과 같은 규칙:
 *  ① **잔여 위험을 비워 두지 않는다.** 비우면 '대책을 세웠으니 안전하다'로 읽히고
 *     그게 현장에서 가장 위험한 착각이다.
 *  ② 2인 이상일 때만 성립하는 대책을 넣는다 — 인원 설정이 결과를 실제로 바꿔야 한다.
 */
import type { Hazard } from '@entities/safety/model'

export const PUBLIC_HAZARDS_CREW_2: Hazard[] = [
  {
    id: 'rh-1',
    step: '도로변 표준지 조사',
    cause: '차량 접촉 — 갓길 보행 중 후방 미인지',
    frequency: 3,
    severity: 5,
    control:
      '2인 1조로 1명이 후방 경계, 안전조끼·경광봉 착용, 왕복 2차로 이상은 갓길 정차 후 도보 접근',
    residual: '경계자가 있어도 야간·우천 시 시인성은 떨어진다. 해당 조건에서는 조사를 미룬다.',
  },
  {
    id: 'rh-2',
    step: '경사지·임야 진입',
    cause: '실족·미끄러짐 — 낙엽·결빙 구간',
    frequency: 3,
    severity: 4,
    control: '2인 동행, 등산화·스틱 사용, 진입 전 위치 공유(단말 위치 전송)',
    residual: '통신 음영 구간에서는 위치 공유가 끊긴다. 진입 전후 시각을 사무실에 통보한다.',
  },
  {
    id: 'rh-3',
    step: '소유자·점유자 면담',
    cause: '조사 거부에 따른 대인 마찰',
    frequency: 4,
    severity: 2,
    control: '조사 목적·법적 근거를 먼저 고지, 신분증 제시, 마찰 시 즉시 중단하고 관할과 협의',
    residual: '고지해도 반복 거부되는 필지가 있다. 강제 조사 권한은 없으므로 서면 협조 요청으로 전환한다.',
  },
  {
    id: 'rh-4',
    step: '하절기 장시간 외업',
    cause: '온열질환 — 폭염 경보 구간 연속 조사',
    frequency: 2,
    severity: 3,
    control: '체감온도 33℃ 이상이면 시간당 15분 휴식, 아이스팩·식염 포도당 지급',
    residual: '휴식 장소가 없는 필지가 있다. 그런 구간은 오전에 배치한다.',
  },
]

/** 1인 작업 — 상호 확인·후방 경계가 성립하지 않아 대책과 잔여 위험이 달라진다 */
export const PUBLIC_HAZARDS_CREW_1: Hazard[] = PUBLIC_HAZARDS_CREW_2.map((h) => {
  if (h.id === 'rh-1' || h.id === 'rh-2') {
    return {
      ...h,
      // 동행·경계가 빠지면 빈도가 올라간다
      frequency: h.frequency + 1,
      control: h.control
        .replace(/2인 1조로 1명이 후방 경계, /, '')
        .replace(/2인 동행, /, ''),
      residual: `${h.residual} 1인 조사라 사고 시 즉시 대응할 사람이 없다 — 2인 배치를 권고한다.`,
    }
  }
  return h
})

export const PUBLIC_SAFETY_REFERENCES: string[] = [
  '산업안전보건법 제36조 (위험성평가의 실시)',
  '산업안전보건기준에 관한 규칙 제3조 (전도의 방지)',
  '표준지공시지가 조사·평가 지침 제2장 (현장조사 절차)',
  '복무규정 제31조 제3항 (현장조사 출장)',
]
