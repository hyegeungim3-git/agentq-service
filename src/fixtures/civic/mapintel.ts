/**
 * 행정(한성시청) 지도 인텔리전스 — 행정동별 인구 1천 명당 민원 접수.
 *
 * 앞의 두 팩과 같은 규칙이다. **값이 없는 곳을 빼지 않는다** —
 * 빼면 '전 지역이 이렇다'로 읽힌다.
 *
 * 인구 대비로 잰다. 절대 건수로 재면 인구가 많은 동이 늘 1위라 아무것도
 * 알려 주지 않는다 — 이게 이 지표의 값어치다.
 *
 * 높을수록 주의다. 강변동은 하천 공사 구간 민원이 몰린 곳으로,
 * 알림·회의록·분석이 모두 같은 사건을 가리킨다.
 *
 * ⚠️ 격자는 배치 도식이지 지리 좌표가 아니다.
 */
import type { MapIntel } from '@entities/mapintel/model'

export const CIVIC_COMPLAINT_RATE: MapIntel = {
  metricLabel: '인구 1천 명당 민원 접수',
  unit: '건',
  period: '2026년 1분기',
  lowerIsWorse: false,
  threshold: 12,
  sites: [
    { id: 'dong-gangbyeon', name: '강변동', region: '북부', col: 2, row: 1, value: 18.4, trend: [9.2, 10.1, 12.6, 14.8, 16.9, 18.4], missingReason: null },
    { id: 'dong-jungang', name: '중앙동', region: '중부', col: 3, row: 1, value: 13.1, trend: [12.4, 12.6, 12.8, 13.0, 13.2, 13.1], missingReason: null },
    { id: 'dong-hanseong', name: '한성동', region: '중부', col: 1, row: 1, value: 9.6, trend: [9.1, 9.3, 9.4, 9.5, 9.5, 9.6], missingReason: null },
    { id: 'dong-songpa', name: '송파동', region: '동부', col: 4, row: 1, value: 7.2, trend: [7.0, 7.1, 7.1, 7.2, 7.2, 7.2], missingReason: null },

    { id: 'dong-daehak', name: '대학동', region: '북부', col: 1, row: 2, value: 11.8, trend: [10.9, 11.1, 11.3, 11.5, 11.7, 11.8], missingReason: null },
    { id: 'dong-sinheung', name: '신흥동', region: '중부', col: 2, row: 2, value: 12.4, trend: [11.8, 12.0, 12.1, 12.2, 12.3, 12.4], missingReason: null },
    { id: 'dong-pyeonghwa', name: '평화동', region: '남부', col: 3, row: 2, value: 8.9, trend: [8.6, 8.7, 8.8, 8.8, 8.9, 8.9], missingReason: null },
    /* 통합 직후라 접수 자료가 아직 분리되지 않았다 */
    { id: 'dong-saedeul', name: '새들동', region: '남부', col: 4, row: 2, value: null, trend: [], missingReason: '3월 1일 행정동 통합으로 접수 자료가 아직 분리되지 않았습니다.' },

    { id: 'dong-nokcheon', name: '녹천동', region: '북부', col: 1, row: 3, value: 6.4, trend: [6.2, 6.3, 6.3, 6.4, 6.4, 6.4], missingReason: null },
    { id: 'dong-sangdo', name: '상도동', region: '동부', col: 2, row: 3, value: 10.2, trend: [9.8, 9.9, 10.0, 10.1, 10.2, 10.2], missingReason: null },
    { id: 'dong-yeonhui', name: '연희동', region: '남부', col: 3, row: 3, value: 7.8, trend: [7.5, 7.6, 7.7, 7.7, 7.8, 7.8], missingReason: null },
    /* 접수 창구가 본청으로 통합돼 동 단위 집계가 없다 */
    { id: 'dong-cheongsan', name: '청산동', region: '동부', col: 4, row: 3, value: null, trend: [], missingReason: '접수 창구가 본청으로 통합돼 동 단위 집계가 없습니다.' },
  ],
}
