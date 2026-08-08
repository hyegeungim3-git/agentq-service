/**
 * 공정 데이터 분석 fixture.
 *
 * 데이터셋별로 결과가 다르다. 예전에는 분석 유형만으로 결과를 골랐고, 그래서
 * 무엇을 고르든 같은 불량률 추이가 나왔다 — 고르는 행위에 의미가 없는 화면이었다.
 * 데이터가 다르면 지표도 단위도 적용률도 달라야 한다.
 *
 * 적용률을 데이터셋마다 다르게 뒀다.
 *  - 경도검사 0.71 : 로트 키 미발행 29%(데이터 조회·기준정보 표준화와 같은 세계관)
 *  - 진동 트렌드 0.86 : 센서 점검 구간 결측
 *  - 온도 프로파일 1.00 : 설비 자체 로거라 결측이 없다 — 경고가 뜨지 않는 경로도 있어야
 *    '부분 결론' 표시가 죽은 코드가 되지 않는다
 */
import type { AnalysisResult, StoredAnalysisKind } from '@entities/analysis/model'

type ResultsByKind = Record<StoredAnalysisKind, AnalysisResult>

export const ANALYSIS_RESULTS: Record<string, ResultsByKind> = {
  /* 로트별 경도검사 — 공정조건과 품질 결과를 잇는 데이터 */
  'ds-hardness-lot': {
    trend: {
      datasetId: 'ds-hardness-lot',
      kind: 'trend',
      unit: '%',
      elapsedSeconds: 5.4,
      coverage: 0.71,
      trend: [
        { period: '2025.10', value: 0.61, limit: 0.5 },
        { period: '2025.11', value: 0.58, limit: 0.5 },
        { period: '2025.12', value: 0.55, limit: 0.5 },
        { period: '2026.01', value: 0.49, limit: 0.5 },
        { period: '2026.02', value: 0.48, limit: 0.5 },
        { period: '2026.03', value: 0.42, limit: 0.5 },
      ],
      distribution: [],
      stats: [
        { metric: '3월 불량률', value: '0.42%', change: '-0.06%p', status: 'good' },
        { metric: '관리 기준', value: '0.50%', change: null, status: 'good' },
        { metric: '기준 초과 개월', value: '3개월', change: '-3개월', status: 'watch' },
        { metric: '분석 적용률', value: '71%', change: null, status: 'watch' },
      ],
      excludedReasons: [
        '로트 키 미발행 실적 29% — 공정 조건과 연결할 수 없어 제외했습니다.',
        '이 결론은 전체가 아니라 추적 가능한 71%에 대한 것입니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-hardness-lot',
      kind: 'distribution',
      unit: '%',
      elapsedSeconds: 4.8,
      coverage: 0.71,
      trend: [],
      distribution: [
        { label: '치수 불량', count: 142 },
        { label: '표면 결함', count: 96 },
        { label: '버 과다', count: 61 },
        { label: '경도 미달', count: 28 },
        { label: '기타', count: 17 },
      ],
      stats: [
        { metric: '총 불량', value: '344건', change: '-52건', status: 'good' },
        { metric: '최다 원인', value: '치수 불량', change: null, status: 'watch' },
        { metric: '상위 2개 비중', value: '69%', change: '+4%p', status: 'bad' },
        { metric: '분석 적용률', value: '71%', change: null, status: 'watch' },
      ],
      excludedReasons: [
        '로트 키 미발행 실적 29% — 원인 분류가 불가해 제외했습니다.',
        '기타 17건은 분류 코드가 없어 원인을 특정하지 못했습니다.',
      ],
    },
  },

  /* 침탄로 3호기 온도 프로파일 — 편차는 절대값으로 본다(부호가 아니라 크기가 문제다) */
  'ds-furnace-temp': {
    trend: {
      datasetId: 'ds-furnace-temp',
      kind: 'trend',
      unit: '℃',
      elapsedSeconds: 8.1,
      coverage: 1,
      trend: [
        { period: '2025.10', value: 3.1, limit: 5 },
        { period: '2025.11', value: 4.0, limit: 5 },
        { period: '2025.12', value: 4.9, limit: 5 },
        { period: '2026.01', value: 5.8, limit: 5 },
        { period: '2026.02', value: 6.9, limit: 5 },
        { period: '2026.03', value: 7.8, limit: 5 },
      ],
      distribution: [],
      stats: [
        { metric: '3월 후단존 편차', value: '7.8℃', change: '+0.9℃', status: 'bad' },
        { metric: '관리 한계', value: '5.0℃', change: null, status: 'good' },
        { metric: '기준 초과 개월', value: '3개월', change: '+3개월', status: 'bad' },
        { metric: '분석 적용률', value: '100%', change: null, status: 'good' },
      ],
      excludedReasons: [],
    },
    distribution: {
      datasetId: 'ds-furnace-temp',
      kind: 'distribution',
      unit: '℃',
      elapsedSeconds: 6.2,
      coverage: 1,
      trend: [],
      distribution: [
        { label: '후단존', count: 118 },
        { label: '중앙존', count: 34 },
        { label: '전단존', count: 12 },
      ],
      stats: [
        { metric: '한계 초과 구간', value: '164회', change: '+61회', status: 'bad' },
        { metric: '최다 발생', value: '후단존', change: null, status: 'bad' },
        { metric: '후단존 비중', value: '72%', change: '+9%p', status: 'bad' },
        { metric: '분석 적용률', value: '100%', change: null, status: 'good' },
      ],
      excludedReasons: [],
    },
  },

  /* 프레스 라인 진동 트렌드 — 예지보전 수집기 */
  'ds-vibration-pdm': {
    trend: {
      datasetId: 'ds-vibration-pdm',
      kind: 'trend',
      unit: 'mm/s',
      elapsedSeconds: 3.9,
      coverage: 0.86,
      trend: [
        { period: '2025.10', value: 2.9, limit: 3.5 },
        { period: '2025.11', value: 3.1, limit: 3.5 },
        { period: '2025.12', value: 3.3, limit: 3.5 },
        { period: '2026.01', value: 3.6, limit: 3.5 },
        { period: '2026.02', value: 3.9, limit: 3.5 },
        { period: '2026.03', value: 4.2, limit: 3.5 },
      ],
      distribution: [],
      stats: [
        { metric: 'PRS-C03 진동', value: '4.2mm/s', change: '+0.3mm/s', status: 'bad' },
        { metric: '관리 기준', value: '3.5mm/s', change: null, status: 'good' },
        { metric: '기준 초과 개월', value: '3개월', change: '+3개월', status: 'bad' },
        { metric: '분석 적용률', value: '86%', change: null, status: 'watch' },
      ],
      excludedReasons: [
        '센서 점검으로 비어 있는 구간 14% — 측정값이 없어 제외했습니다.',
        '결측 구간이 상승 국면에 걸쳐 있어 실제 상승폭은 더 클 수 있습니다.',
      ],
    },
    distribution: {
      datasetId: 'ds-vibration-pdm',
      kind: 'distribution',
      unit: 'mm/s',
      elapsedSeconds: 3.4,
      coverage: 0.86,
      trend: [],
      distribution: [
        { label: 'PRS-C03', count: 27 },
        { label: 'PRS-C01', count: 8 },
        { label: 'PRS-C05', count: 5 },
        { label: 'FUR-03', count: 3 },
        { label: 'CNC-A12', count: 1 },
      ],
      stats: [
        { metric: '알람 총건', value: '44건', change: '+19건', status: 'bad' },
        { metric: '최다 설비', value: 'PRS-C03', change: null, status: 'bad' },
        { metric: 'PRS-C03 비중', value: '61%', change: '+22%p', status: 'bad' },
        { metric: '분석 적용률', value: '86%', change: null, status: 'watch' },
      ],
      excludedReasons: [
        '센서 점검으로 비어 있는 구간 14% — 알람 집계에서 제외했습니다.',
        '점검 중 발생한 알람은 설비 이상과 구분되지 않아 세지 않았습니다.',
      ],
    },
  },
}
