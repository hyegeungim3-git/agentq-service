/**
 * 지도 인텔리전스 fixture — 한빛정밀 사업장별 설비 가동률.
 *
 * 값이 없는 사업장을 일부러 두 곳 뒀다. 전부 값이 있으면 '값이 없는 경우'를
 * 보여 주는 화면이 죽은 코드가 된다. 실제로 이런 상황이 더 흔하다 —
 * 신규 인수 사업장, 시스템 미연동, 수집기 미설치.
 *
 * 창원본사는 진동 알람이 난 PRS-C03이 있는 곳이라 가동률도 기준 아래다.
 * 다른 fixture(라이브 지표·알림·오케스트레이션)와 같은 사건을 가리킨다.
 */
import type { MapIntel } from '@entities/mapintel/model'

export const SITE_UTILIZATION: MapIntel = {
  metricLabel: '설비 가동률',
  unit: '%',
  period: '2026-07-01 ~ 2026-07-12',
  /* 가동률은 낮을수록 나쁘다 — 색과 문구의 방향이 뒤집힌다 */
  lowerIsWorse: true,
  threshold: 85,
  sites: [
    {
      id: 'site-cw',
      name: '창원본사',
      region: '경남 창원',
      col: 1,
      row: 2,
      value: 81.4,
      trend: [88.2, 87.1, 86.0, 84.3, 82.9, 81.4],
      missingReason: null,
    },
    {
      id: 'site-gh1',
      name: '김해1공장',
      region: '경남 김해',
      col: 2,
      row: 2,
      value: 91.2,
      trend: [90.1, 90.8, 91.5, 91.0, 91.4, 91.2],
      missingReason: null,
    },
    {
      id: 'site-gh2',
      name: '김해2공장',
      region: '경남 김해',
      col: 2,
      row: 3,
      value: 88.6,
      trend: [87.2, 88.0, 88.4, 89.1, 88.8, 88.6],
      missingReason: null,
    },
    {
      id: 'site-ys',
      name: '양산공장',
      region: '경남 양산',
      col: 3,
      row: 2,
      value: 83.7,
      trend: [86.5, 85.9, 85.1, 84.4, 84.0, 83.7],
      missingReason: null,
    },
    {
      id: 'site-dg',
      name: '대구공장',
      region: '대구 달성',
      col: 3,
      row: 1,
      value: 93.5,
      trend: [92.0, 92.6, 93.1, 93.4, 93.6, 93.5],
      missingReason: null,
    },
    {
      id: 'site-ca',
      name: '천안공장',
      region: '충남 천안',
      col: 2,
      row: 1,
      value: null,
      trend: [],
      missingReason: 'MES 미연동 — 가동 실적을 수기 집계 중입니다',
    },
    {
      id: 'site-gj',
      name: '광주공장',
      region: '광주 광산',
      col: 1,
      row: 1,
      value: null,
      trend: [],
      missingReason: '2026-06 인수 — 시스템 이관 중입니다',
    },
  ],
}
