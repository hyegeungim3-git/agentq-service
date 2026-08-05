/**
 * 의료(새빛대학교병원) 지도 인텔리전스 — 진료과별 병상 가동률.
 *
 * 앞의 세 팩과 같은 규칙이다. **값이 없는 곳을 빼지 않는다.**
 *
 * 가동률은 **높을수록 주의**다. 응급의료센터가 92.1%로 가장 높고,
 * 알림·회의록·분석이 모두 같은 사건을 가리킨다.
 *
 * ⚠️ 격자는 배치 도식이지 실제 병동 배치가 아니다. 화면이 그렇게 말한다.
 */
import type { MapIntel } from '@entities/mapintel/model'

export const MEDICAL_BED_USAGE: MapIntel = {
  siteLabel: '진료과',
  metricLabel: '병상 가동률',
  unit: '%',
  period: '2026년 1분기',
  lowerIsWorse: false,
  threshold: 90,
  sites: [
    { id: 'dept-er', name: '응급의료센터', region: '응급', col: 2, row: 1, value: 92.1, trend: [84.2, 86.0, 87.8, 89.4, 91.0, 92.1], missingReason: null },
    { id: 'dept-im', name: '내과', region: '내과계', col: 1, row: 1, value: 90.6, trend: [88.1, 88.6, 89.2, 89.8, 90.2, 90.6], missingReason: null },
    { id: 'dept-gs', name: '외과', region: '외과계', col: 3, row: 1, value: 87.4, trend: [86.2, 86.5, 86.9, 87.1, 87.3, 87.4], missingReason: null },

    { id: 'dept-os', name: '정형외과', region: '외과계', col: 1, row: 2, value: 91.2, trend: [88.9, 89.4, 90.0, 90.5, 90.9, 91.2], missingReason: null },
    { id: 'dept-nr', name: '신경과', region: '내과계', col: 2, row: 2, value: 84.8, trend: [83.9, 84.1, 84.4, 84.6, 84.7, 84.8], missingReason: null },
    { id: 'dept-ped', name: '소아청소년과', region: '내과계', col: 3, row: 2, value: 71.3, trend: [74.8, 74.0, 73.2, 72.4, 71.8, 71.3], missingReason: null },

    { id: 'dept-obgy', name: '산부인과', region: '외과계', col: 1, row: 3, value: 68.9, trend: [70.2, 69.8, 69.5, 69.2, 69.0, 68.9], missingReason: null },
    /* 병동 리모델링으로 운영을 멈춘 기간이라 분모가 없다 */
    { id: 'dept-rh', name: '재활의학과', region: '내과계', col: 2, row: 3, value: null, trend: [], missingReason: '병동 리모델링으로 1~2월 운영을 멈춰 분기 가동률을 낼 수 없습니다.' },
    /* 낮 병동이라 재원 개념이 달라 같은 지표로 못 잰다 */
    { id: 'dept-dc', name: '주간진료센터', region: '외래', col: 3, row: 3, value: null, trend: [], missingReason: '낮 병동이라 재원 기준이 달라 병상 가동률로 재지 않습니다.' },
  ],
}
