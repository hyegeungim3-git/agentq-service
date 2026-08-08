/**
 * 데이터 카탈로그 · 리니지 fixture.
 *
 * 세계관은 한빛정밀이다. 자산은 다른 화면이 쓰는 것과 같은 것을 가리킨다 —
 * 작업표준·안전 규정(문서 검색), 품질 집계 테이블(수치 집계), 검사성적서 스캔(문서 인식).
 *
 * **리니지가 없는 자산을 하나 넣었다.** 전부 그려져 있으면 '계보가 없다'를 말하는
 * 자리가 죽은 코드가 된다. 실제로도 새로 붙인 자산은 계보가 늦게 그려진다.
 *
 * **집계에 쓰이는데 표준화가 낮은 자산도 넣었다.** 이것이 이 화면에서 실제로
 * 위험한 것이다 — 문서 검색이면 사람이 읽고 판단하지만, 집계는 틀린 수치를 그대로 답한다.
 */
import type { DataAsset, Lineage } from '@entities/catalog/model'

export const DATA_ASSETS: DataAsset[] = [
  {
    id: 'as-1',
    name: '작업표준·안전보건 규정',
    source: '문서관리시스템',
    owner: '안전보건팀',
    grade: 'internal',
    format: 'PDF · HWP',
    volume: '문서 1,240건',
    updateCycle: '수시',
    freshness: '2일 전',
    standardizedRatio: 100,
    usage: 'search',
    consumers: ['지식 검색', '내규·규정 조회'],
  },
  {
    id: 'as-2',
    name: '품질 집계 테이블',
    source: 'MES 원장',
    owner: '품질보증팀',
    grade: 'restricted',
    format: '관계형 테이블',
    volume: '월 12,400행',
    updateCycle: '일 1회',
    freshness: '8시간 전',
    standardizedRatio: 74,
    usage: 'aggregate',
    consumers: ['데이터 조회·분석', '표준 보고서 작성', '데이터 시각화 분석'],
  },
  {
    id: 'as-3',
    name: '검사성적서 스캔본',
    source: '스캐너 · 업로드',
    owner: '품질보증팀',
    grade: 'internal',
    format: '이미지',
    volume: '월 286건',
    updateCycle: '수시',
    freshness: '1일 전',
    standardizedRatio: 45,
    usage: 'ocr',
    consumers: ['문서 인식(OCR)'],
  },
  {
    id: 'as-4',
    name: '설비 진동 센서 이력',
    source: '설비 IoT 게이트웨이',
    owner: '설비보전팀',
    grade: 'internal',
    format: '시계열',
    volume: '일 86,400점',
    updateCycle: '실시간',
    freshness: '3분 전',
    standardizedRatio: 96,
    usage: 'aggregate',
    consumers: ['데이터 조회·분석', '예지보전 릴레이'],
  },
]

/** `as-4`는 계보가 아직 안 그려졌다 — 최근에 붙인 자산이다 */
export const LINEAGES: Lineage[] = [
  {
    assetId: 'as-1',
    upstream: [
      { name: '부서별 규정 원본', kind: '파일' },
      { name: '개정 이력', kind: '문서' },
    ],
    stages: [
      { name: '수집', what: '문서관리시스템 연동 수집', tool: '커넥터' },
      { name: '쪼개기', what: '조항 단위 분할(512토큰)', tool: 'RAG 파이프라인' },
      { name: '색인', what: '벡터 생성·색인', tool: '임베딩 엔진' },
    ],
    downstream: [
      { name: '지식 검색 에이전트', kind: '에이전트' },
      { name: '내규·규정 조회 에이전트', kind: '에이전트' },
    ],
  },
  {
    assetId: 'as-2',
    upstream: [{ name: 'MES 생산 원장', kind: 'DB' }],
    stages: [
      { name: '추출', what: '일 1회 배치 추출', tool: 'ETL' },
      { name: '표준화', what: '불량 코드·단위 표준 매핑', tool: '기준정보 사전' },
      { name: '적재', what: '분석 DB 적재', tool: '분석 DB' },
    ],
    downstream: [
      { name: '데이터 조회·분석 에이전트', kind: '에이전트' },
      { name: '표준 보고서 작성', kind: '에이전트' },
    ],
  },
  {
    assetId: 'as-3',
    upstream: [{ name: '스캔 원본', kind: '이미지' }],
    stages: [
      { name: '전처리', what: '기울기·잡티 보정', tool: '이미지 전처리' },
      { name: '문자 인식', what: '문자·표 인식', tool: 'OCR 엔진' },
    ],
    downstream: [{ name: '문서 인식 에이전트', kind: '에이전트' }],
  },
]
