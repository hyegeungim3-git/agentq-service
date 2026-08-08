/**
 * 공공(한국부동산원) 데이터 분석.
 *
 * 제조 팩과 같은 규칙 — **데이터셋이 다르면 지표도 단위도 적용률도 달라야 한다.**
 * 무엇을 골라도 같은 추이가 나오면 고르는 행위에 의미가 없다.
 *
 * 적용률(`coverage`)을 데이터셋마다 다르게 뒀다. **분석에 쓰이지 못한 데이터를
 * 드러내는 것**이 이 에이전트의 값어치인데, 전부 1.00이면 그 표시가 죽은 코드가 된다.
 *  - 이의신청 0.82 : 접수 경로가 서면인 건은 사유 코드가 비어 있다
 *  - 실거래 0.94 : 정정 신고분이 원 신고와 중복돼 일부를 뺐다
 *  - 표준지 1.00 : 조사 시스템 자체 집계라 결측이 없다
 */
import type { StoredAnalysisKind, AnalysisResult } from '@entities/analysis/model'

export const PUBLIC_ANALYSES: Record<string, Record<StoredAnalysisKind, AnalysisResult>> = {
  'ds-reb-appeal': {
    trend: {
      datasetId: 'ds-reb-appeal',
      kind: 'trend',
      unit: '건',
      elapsedSeconds: 5.1,
      coverage: 0.82,
      trend: [
        { period: '2025.10', value: 214, limit: 250 },
        { period: '2025.11', value: 236, limit: 250 },
        { period: '2025.12', value: 259, limit: 250 },
        { period: '2026.01', value: 288, limit: 250 },
        { period: '2026.02', value: 317, limit: 250 },
        { period: '2026.03', value: 342, limit: 250 },
      ],
      distribution: [],
      stats: [
        { metric: '접수 합계(6개월)', value: '1,656건', change: null, status: 'watch' },
        { metric: '월평균', value: '276건', change: '+26건', status: 'bad' },
        { metric: '기준(250건) 초과 개월', value: '4개월', change: '2025.12부터 연속', status: 'bad' },
      ],
      excludedReasons: [
        '서면으로 접수된 61건은 사유 코드가 비어 있어 유형 분석에서 제외했습니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-reb-appeal',
      kind: 'distribution',
      unit: '건',
      elapsedSeconds: 4.6,
      coverage: 0.82,
      trend: [],
      distribution: [
        { label: '이용상황 이견', count: 118 },
        { label: '인근 표준지 대비', count: 96 },
        { label: '도로조건 이견', count: 54 },
        { label: '면적·형상 오기', count: 32 },
        { label: '기타', count: 42 },
      ],
      stats: [
        { metric: '최다 사유', value: '이용상황 이견 118건', change: '전체의 34%', status: 'watch' },
        { metric: '상위 2개 사유 합계', value: '214건', change: '전체의 63%', status: 'watch' },
        { metric: '분류 대상', value: '342건', change: null, status: 'good' },
      ],
      excludedReasons: [
        '서면 접수 61건은 사유 코드가 없어 분류에 넣지 못했습니다.',
      ],
    },
  },

  'ds-reb-rtms': {
    trend: {
      datasetId: 'ds-reb-rtms',
      kind: 'trend',
      unit: '%',
      elapsedSeconds: 4.8,
      coverage: 0.94,
      trend: [
        { period: '2025.10', value: 0.28, limit: 0.5 },
        { period: '2025.11', value: 0.31, limit: 0.5 },
        { period: '2025.12', value: 0.36, limit: 0.5 },
        { period: '2026.01', value: 0.41, limit: 0.5 },
        { period: '2026.02', value: 0.44, limit: 0.5 },
        { period: '2026.03', value: 0.43, limit: 0.5 },
      ],
      distribution: [],
      stats: [
        { metric: '의심 거래 비율', value: '0.43%', change: '-0.01%p', status: 'watch' },
        { metric: '검증 대상', value: '1,842건', change: null, status: 'good' },
        { metric: '정밀조사 분류', value: '8건', change: '괴리율 30% 이상', status: 'watch' },
      ],
      excludedReasons: [
        '정정 신고 112건은 원 신고와 중복되어 제외했습니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-reb-rtms',
      kind: 'distribution',
      unit: '건',
      elapsedSeconds: 4.2,
      coverage: 0.94,
      trend: [],
      distribution: [
        { label: '수도권', count: 4 },
        { label: '충청권', count: 2 },
        { label: '경상권', count: 2 },
        { label: '전라권', count: 0 },
        { label: '강원·제주', count: 0 },
      ],
      stats: [
        { metric: '의심 거래', value: '8건', change: null, status: 'watch' },
        { metric: '최다 권역', value: '수도권 4건', change: '전체의 50%', status: 'watch' },
        { metric: '지자체 통보', value: '3건', change: '특수관계인 확인', status: 'bad' },
      ],
      excludedReasons: [
        '정정 신고 112건은 원 신고와 중복되어 제외했습니다.',
      ],
    },
  },

  'ds-reb-landprice': {
    trend: {
      datasetId: 'ds-reb-landprice',
      kind: 'trend',
      unit: '%',
      elapsedSeconds: 3.4,
      coverage: 1,
      trend: [
        { period: '2021', value: 2.11, limit: 4 },
        { period: '2022', value: 2.54, limit: 4 },
        { period: '2023', value: 2.32, limit: 4 },
        { period: '2024', value: 2.78, limit: 4 },
        { period: '2025', value: 2.83, limit: 4 },
        { period: '2026', value: 3.24, limit: 4 },
      ],
      distribution: [],
      stats: [
        { metric: '2026년 변동률', value: '3.24%', change: '+0.41%p', status: 'watch' },
        { metric: '5년 평균(2021~2025)', value: '2.64%', change: null, status: 'good' },
        { metric: '집계 시·도', value: '15곳', change: '울산·제주 확정 전', status: 'watch' },
      ],
      excludedReasons: [],
    },
    distribution: {
      datasetId: 'ds-reb-landprice',
      kind: 'distribution',
      unit: '곳',
      elapsedSeconds: 3.1,
      coverage: 1,
      trend: [],
      distribution: [
        { label: '4% 이상', count: 3 },
        { label: '3~4%', count: 2 },
        { label: '2~3%', count: 7 },
        { label: '2% 미만', count: 3 },
      ],
      stats: [
        { metric: '집계 시·도', value: '15곳 / 17곳', change: null, status: 'watch' },
        { metric: '주의 기준(4%) 초과', value: '3곳', change: '세종·서울·대전', status: 'bad' },
        { metric: '평균(집계 15곳)', value: '3.0%', change: null, status: 'watch' },
      ],
      excludedReasons: [],
    },
  },
}
