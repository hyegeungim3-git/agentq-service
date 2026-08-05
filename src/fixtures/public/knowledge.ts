/**
 * 공공(한국부동산원) 지식 검색.
 *
 * 제조 팩이 '유사 도면 재사용'을 다루는 자리에서, 여기는 **유사 표준지 대조**를
 * 다룬다. 조사자가 새 표준지 가격을 정할 때 실제로 하는 일이 그것이다 —
 * 이용상황·도로조건·형상이 비슷한 선례를 찾아 견준다.
 *
 * 제조 팩과 같은 규칙:
 *  ① 1위가 왜 1위이고 2위가 왜 밀렸는지 **속성 대조**에서 드러나야 한다.
 *     전부 일치시키면 '왜 유사한가'를 보여 주는 화면이 죽은 코드가 된다.
 *  ② 대외비를 섞는다 — 보안 등급 필터가 실제로 무언가를 거를 수 있어야 한다.
 */
import type { KnowledgeBase } from '@entities/knowledge/model'
import type { CorpusItem } from '../knowledge'

export const PUBLIC_KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 'kb-reb-parcel', name: '표준지 조사 이력', docCount: 56_200, updatedAt: '2026-03-18' },
  { id: 'kb-reb-guide', name: '공시업무 지침·매뉴얼', docCount: 34, updatedAt: '2026-01-05' },
  { id: 'kb-reb-appeal', name: '이의신청 처리 사례집', docCount: 412, updatedAt: '2026-03-20' },
  { id: 'kb-reb-balance', name: '가격 균형 협의 조서', docCount: 168, updatedAt: '2026-03-11' },
  { id: 'kb-reb-rtms', name: '실거래 검증 판정 사례', docCount: 297, updatedAt: '2026-03-22' },
  { id: 'kb-reb-law', name: '부동산 공시 법령·유권해석', docCount: 89, updatedAt: '2026-02-14' },
]

/** 진행 중인 조사 대상 — 후보를 무엇과 견주는지 화면이 밝혀야 한다 */
export const PUBLIC_REFERENCE_SPEC = '2026년 신규 표준지 A-1042'

export const PUBLIC_CORPUS: CorpusItem[] = [
  {
    id: 'kn-reb-2024-8812',
    title: '표준지 2024-8812 (상업용, 광대소각)',
    baseId: 'kb-reb-parcel',
    security: 'internal',
    snippet:
      '이용상황 상업용, 도로조건 광대소각, 형상 세로장방형. 인접 표준지와 가격 균형 협의를 거친 이력이 있다.',
    body:
      '표준지 2024-8812 상업용 광대소각 세로장방형 평지 면적 412제곱미터 ' +
      '용도지역 일반상업지역 가격 균형 협의 이력 인접 시군 경계 500미터',
    concepts: ['표준지', '이용상황', '도로조건', '상업용', '가격', '협의'],
    weight: 0.95,
    drawing: {
      code: '2024-8812',
      year: 2024,
      attributes: [
        { label: '이용상황', queryValue: '상업용', candidateValue: '상업용', matched: true },
        { label: '용도지역', queryValue: '일반상업지역', candidateValue: '일반상업지역', matched: true },
        { label: '도로조건', queryValue: '광대소각', candidateValue: '광대소각', matched: true },
        { label: '형상', queryValue: '가장형', candidateValue: '세로장방형', matched: false },
        { label: '지세', queryValue: '평지', candidateValue: '평지', matched: true },
        { label: '면적', queryValue: '398㎡', candidateValue: '412㎡', matched: false },
      ],
      reusable: ['가격 균형 협의 조서 양식', '지역요인 비교표', '개별요인 산정 근거'],
    },
  },
  {
    id: 'kn-reb-2023-4471',
    title: '표준지 2023-4471 (상업용, 중로한면)',
    baseId: 'kb-reb-parcel',
    security: 'internal',
    snippet: '도로조건이 달라 그대로 견주기 어렵다. 개별요인 보정 근거가 상세히 남아 있다.',
    body:
      '표준지 2023-4471 상업용 중로한면 가장형 평지 면적 386제곱미터 ' +
      '일반상업지역 개별요인 보정 도로접면 감가 적용',
    concepts: ['표준지', '이용상황', '도로조건', '상업용', '가격'],
    weight: 0.78,
    drawing: {
      code: '2023-4471',
      year: 2023,
      attributes: [
        { label: '이용상황', queryValue: '상업용', candidateValue: '상업용', matched: true },
        { label: '용도지역', queryValue: '일반상업지역', candidateValue: '일반상업지역', matched: true },
        { label: '도로조건', queryValue: '광대소각', candidateValue: '중로한면', matched: false },
        { label: '형상', queryValue: '가장형', candidateValue: '가장형', matched: true },
        { label: '지세', queryValue: '평지', candidateValue: '평지', matched: true },
        { label: '면적', queryValue: '398㎡', candidateValue: '386㎡', matched: true },
      ],
      reusable: ['개별요인 보정 근거', '도로접면 감가율 표'],
    },
  },
  {
    id: 'kn-reb-appeal-0317',
    title: '이의신청 처리 사례 2025-0317 (이용상황 변경 미기재)',
    baseId: 'kb-reb-appeal',
    security: 'internal',
    snippet:
      '조사표에 이용상황 변동 사유가 없어 반려된 뒤 재조사로 가격이 조정된 사례. 처리 기한 준수 방법이 함께 정리돼 있다.',
    body:
      '이의신청 2025-0317 이용상황 변경 사유 미기재 반려 재조사 위원회 재심의 ' +
      '접수일 30일 이내 처리 서면 통지 가격 조정',
    concepts: ['이의신청', '이용상황', '조사표', '재조사', '기한'],
    weight: 0.9,
  },
  {
    id: 'kn-reb-balance-0142',
    title: '가격 균형 협의 조서 2025-0142 (경계 3.4%p 차이)',
    baseId: 'kb-reb-balance',
    security: 'internal',
    snippet:
      '인접 시·군 경계 표준지의 변동률 차이가 기준을 넘어 협의한 사례. 협의 후 조정 폭과 근거가 남아 있다.',
    body:
      '가격 균형 협의 2025-0142 경계 500미터 이내 변동률 차이 3.4퍼센트포인트 ' +
      '협의 조서 지역요인 비교 조정',
    concepts: ['협의', '경계', '가격', '변동률', '표준지'],
    weight: 0.85,
  },
  {
    id: 'kn-reb-rtms-0288',
    title: '실거래 검증 판정 사례 2025-0288 (특수관계인 거래)',
    baseId: 'kb-reb-rtms',
    /* 대외비 — 보안 등급 필터가 실제로 무언가를 거를 수 있어야 한다 */
    security: 'confidential',
    snippet:
      '시세 괴리율 41%로 분류된 거래가 특수관계인 간 거래로 확인돼 지자체에 통보된 사례.',
    body:
      '실거래 검증 2025-0288 괴리율 41퍼센트 특수관계인 거래 자금조달계획서 ' +
      '지자체 통보 정밀조사 판정 근거 검증 대장',
    concepts: ['실거래', '거래', '괴리', '검증', '의심'],
    weight: 0.88,
  },
  {
    id: 'kn-reb-guide-ch2',
    title: '표준지 조사 실무 매뉴얼 제2장 (현장조사)',
    baseId: 'kb-reb-guide',
    security: 'public',
    snippet: '현장조사에서 확인할 항목과 조사표 기재 방법을 정리한 실무 매뉴얼.',
    body:
      '현장조사 이용상황 도로조건 형상 지세 확인 조사표 기재 변동 사유 ' +
      '사진 촬영 기준 조사자 검증자 업무 구분',
    concepts: ['조사표', '현장조사', '이용상황', '지침', '표준지'],
    weight: 0.72,
  },
  {
    id: 'kn-reb-law-0092',
    title: '유권해석 2025-0092 (이의신청 처리 기한 기산점)',
    baseId: 'kb-reb-law',
    security: 'public',
    snippet: '처리 기한의 기산점을 접수일로 보는 근거와 보완 요구 시 기한 정지 여부를 다룬 해석.',
    body:
      '유권해석 2025-0092 이의신청 처리 기한 기산점 접수일 보완 요구 기간 ' +
      '부동산 가격공시에 관한 법률 제7조',
    concepts: ['이의신청', '기한', '법령', '해석'],
    weight: 0.8,
  },
]
