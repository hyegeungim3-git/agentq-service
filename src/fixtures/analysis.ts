/**
 * 공정 데이터 분석 fixture.
 *
 * 적용률을 일부러 71%로 뒀다. 100%면 '부분 결론' 경고가 죽은 코드가 되고,
 * 실제 현장에서 결측이 있을 때 화면이 대응하지 못한다.
 * 71%라는 숫자는 데이터 조회 fixture의 '로트 키 결측 29%'와 같은 세계관이다.
 */
import type { AnalysisKind, AnalysisResult } from '@entities/analysis/model'

export const ANALYSIS_RESULTS: Record<AnalysisKind, AnalysisResult> = {
  trend: {
    documentId: 'doc-quality-report',
    kind: 'trend',
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
    documentId: 'doc-quality-report',
    kind: 'distribution',
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
}
