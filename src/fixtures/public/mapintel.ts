/**
 * 공공(한국부동산원) 지도 인텔리전스 — 시·도별 표준지 공시지가 변동률.
 *
 * 제조 팩과 같은 규칙이다. **값이 없는 곳을 빼지 않는다** — 빼면 '전국이 이렇다'로
 * 읽힌다. 조사 마감 전이라 아직 확정되지 않은 곳이 실제로 있고, 그게 이 시즌의
 * 사실이다(다른 fixture의 '조사 마감 D-12'와 같은 사건이다).
 *
 * 변동률은 **높을수록 주의**다. 급등 지역에 이의신청이 몰리기 때문이다 —
 * 알림의 '이의신청 미처리 18건'과 같은 이야기다.
 *
 * ⚠️ 격자는 배치 도식이지 지리 좌표가 아니다. 화면이 그렇게 말한다.
 */
import type { MapIntel } from '@entities/mapintel/model'

export const LAND_PRICE_CHANGE: MapIntel = {
  siteLabel: '시도',
  metricLabel: '표준지 공시지가 변동률',
  unit: '%',
  period: '2026년 공시 (기준일 2026-01-01)',
  lowerIsWorse: false,
  threshold: 4.0,
  sites: [
    { id: 'sd-seoul', name: '서울', region: '수도권', col: 2, row: 1, value: 4.82, trend: [3.1, 3.4, 3.9, 4.2, 4.6, 4.82], missingReason: null },
    { id: 'sd-incheon', name: '인천', region: '수도권', col: 1, row: 1, value: 3.41, trend: [2.6, 2.9, 3.0, 3.2, 3.3, 3.41], missingReason: null },
    { id: 'sd-gyeonggi', name: '경기', region: '수도권', col: 3, row: 1, value: 3.86, trend: [2.9, 3.1, 3.4, 3.6, 3.8, 3.86], missingReason: null },
    { id: 'sd-gangwon', name: '강원', region: '강원', col: 4, row: 1, value: 2.14, trend: [1.7, 1.8, 1.9, 2.0, 2.1, 2.14], missingReason: null },

    { id: 'sd-chungnam', name: '충남', region: '충청', col: 1, row: 2, value: 2.97, trend: [2.3, 2.5, 2.7, 2.8, 2.9, 2.97], missingReason: null },
    { id: 'sd-sejong', name: '세종', region: '충청', col: 2, row: 2, value: 5.12, trend: [3.4, 3.9, 4.3, 4.7, 5.0, 5.12], missingReason: null },
    { id: 'sd-chungbuk', name: '충북', region: '충청', col: 3, row: 2, value: 2.68, trend: [2.1, 2.2, 2.4, 2.5, 2.6, 2.68], missingReason: null },
    { id: 'sd-gyeongbuk', name: '경북', region: '경상', col: 4, row: 2, value: 1.92, trend: [1.6, 1.7, 1.8, 1.85, 1.9, 1.92], missingReason: null },

    { id: 'sd-jeonbuk', name: '전북', region: '전라', col: 1, row: 3, value: 2.05, trend: [1.7, 1.8, 1.9, 1.95, 2.0, 2.05], missingReason: null },
    { id: 'sd-daejeon', name: '대전', region: '충청', col: 2, row: 3, value: 4.23, trend: [3.0, 3.3, 3.7, 3.9, 4.1, 4.23], missingReason: null },
    { id: 'sd-daegu', name: '대구', region: '경상', col: 3, row: 3, value: 2.41, trend: [2.0, 2.1, 2.2, 2.3, 2.35, 2.41], missingReason: null },
    /* 재조사 중이라 확정 전 — 마감 전 시즌의 실제 상황이다 */
    { id: 'sd-ulsan', name: '울산', region: '경상', col: 4, row: 3, value: null, trend: [], missingReason: '이의신청 재조사 진행 중 — 위원회 재심의 전이라 확정값이 없습니다.' },

    { id: 'sd-gwangju', name: '광주', region: '전라', col: 1, row: 4, value: 2.86, trend: [2.2, 2.4, 2.6, 2.7, 2.8, 2.86], missingReason: null },
    { id: 'sd-jeonnam', name: '전남', region: '전라', col: 2, row: 4, value: 1.74, trend: [1.4, 1.5, 1.6, 1.65, 1.7, 1.74], missingReason: null },
    { id: 'sd-gyeongnam', name: '경남', region: '경상', col: 3, row: 4, value: 2.23, trend: [1.9, 2.0, 2.1, 2.15, 2.2, 2.23], missingReason: null },
    { id: 'sd-busan', name: '부산', region: '경상', col: 4, row: 4, value: 3.58, trend: [2.7, 3.0, 3.2, 3.4, 3.5, 3.58], missingReason: null },

    /* 조사표 제출 마감(4월 5일) 전이라 집계가 안 끝났다 */
    { id: 'sd-jeju', name: '제주', region: '제주', col: 2, row: 5, value: null, trend: [], missingReason: '표준지 조사표 제출 마감 전이라 집계가 끝나지 않았습니다.' },
  ],
}
