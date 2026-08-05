/**
 * 행정(한성시청) 지식 검색.
 *
 * 제조가 '유사 도면', 공공이 '유사 표준지'라면 여기는 **유사 민원 처리 사례**다.
 * 담당자가 실제로 하는 일이 그것이다 — 같은 유형의 지난 처리를 찾아 견준다.
 *
 * 앞의 두 팩과 같은 규칙: 1위가 왜 1위인지 속성 대조에서 드러나야 하고,
 * 대외비를 섞어 보안 필터가 실제로 무언가를 거를 수 있어야 한다.
 */
import type { KnowledgeBase } from '@entities/knowledge/model'
import type { CorpusItem } from '../knowledge'

export const CIVIC_KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 'kb-hsc-case', name: '민원 처리 사례집', docCount: 8_640, updatedAt: '2026-03-20' },
  { id: 'kb-hsc-guide', name: '행정 지침·매뉴얼', docCount: 52, updatedAt: '2026-01-08' },
  { id: 'kb-hsc-ad', name: '옥외광고물 정비 이력', docCount: 1_240, updatedAt: '2026-03-18' },
  { id: 'kb-hsc-safety', name: '재난안전 점검 기록', docCount: 386, updatedAt: '2026-03-24' },
  { id: 'kb-hsc-ordinance', name: '조례·규칙·유권해석', docCount: 214, updatedAt: '2026-02-27' },
]

/** 진행 중인 처리 건 — 후보를 무엇과 견주는지 화면이 밝혀야 한다 */
export const CIVIC_REFERENCE_SPEC = '진행 중 민원 C-2026-0417 (하천 공사 소음)'

export const CIVIC_CORPUS: CorpusItem[] = [
  {
    id: 'kn-hsc-2025-1183',
    title: '민원 2025-1183 (하천 정비 공사 소음·분진)',
    baseId: 'kb-hsc-case',
    security: 'internal',
    snippet:
      '같은 공사 구간의 소음·분진 민원. 공사 시간 조정과 살수 차량 배치로 종결했고 재접수가 없었다.',
    body:
      '민원 2025-1183 하천 정비 공사 소음 분진 강변동 공사 시간 조정 살수 차량 ' +
      '현장 확인 2인 종결 재접수 없음 처리 기한 14일',
    concepts: ['민원', '소음', '공사', '현장', '처리'],
    weight: 0.95,
    drawing: {
      code: '2025-1183',
      year: 2025,
      attributes: [
        { label: '민원 유형', queryValue: '소음·분진', candidateValue: '소음·분진', matched: true },
        { label: '발생 지역', queryValue: '강변동', candidateValue: '강변동', matched: true },
        { label: '원인', queryValue: '하천 정비 공사', candidateValue: '하천 정비 공사', matched: true },
        { label: '접수 형태', queryValue: '다수인', candidateValue: '개인', matched: false },
        { label: '현장 확인', queryValue: '필요', candidateValue: '실시', matched: true },
        { label: '처리 기한', queryValue: '14일', candidateValue: '14일', matched: true },
      ],
      reusable: ['공사 시간 조정 협의문', '살수 차량 배치 계획', '민원인 통지문 서식'],
    },
  },
  {
    id: 'kn-hsc-2024-0872',
    title: '민원 2024-0872 (도로 공사 소음)',
    baseId: 'kb-hsc-case',
    security: 'internal',
    snippet: '원인 공사가 달라 그대로 견주기 어렵다. 야간 작업 제한 협의 근거가 남아 있다.',
    body:
      '민원 2024-0872 도로 공사 소음 중앙동 야간 작업 제한 협의 개인 접수 ' +
      '현장 확인 실시 처리 기한 14일',
    concepts: ['민원', '소음', '공사', '처리'],
    weight: 0.76,
    drawing: {
      code: '2024-0872',
      year: 2024,
      attributes: [
        { label: '민원 유형', queryValue: '소음·분진', candidateValue: '소음', matched: false },
        { label: '발생 지역', queryValue: '강변동', candidateValue: '중앙동', matched: false },
        { label: '원인', queryValue: '하천 정비 공사', candidateValue: '도로 공사', matched: false },
        { label: '접수 형태', queryValue: '다수인', candidateValue: '개인', matched: false },
        { label: '현장 확인', queryValue: '필요', candidateValue: '실시', matched: true },
        { label: '처리 기한', queryValue: '14일', candidateValue: '14일', matched: true },
      ],
      reusable: ['야간 작업 제한 협의문'],
    },
  },
  {
    id: 'kn-hsc-ad-0311',
    title: '옥외광고물 정비 사례 2025-0311 (안전 기준 미달 계고)',
    baseId: 'kb-hsc-ad',
    security: 'internal',
    snippet:
      '낙하 위험 광고물을 우선 계고한 사례. 계고 후 미시정분에 대집행을 검토한 경과가 정리돼 있다.',
    body:
      '옥외광고물 2025-0311 안전 기준 미달 낙하 위험 우선 계고 대집행 검토 ' +
      '조례 제9조 시정 기한 14일',
    concepts: ['광고물', '계고', '안전', '정비'],
    weight: 0.9,
  },
  {
    id: 'kn-hsc-safety-0122',
    title: '재난안전 점검 2025-0122 (임시 제방 월류 위험)',
    baseId: 'kb-hsc-safety',
    /* 대외비 — 보안 등급 필터가 실제로 무언가를 거를 수 있어야 한다 */
    security: 'confidential',
    snippet: '공사 구간 임시 제방의 월류 위험을 사전 점검해 보강한 사례. 취약 구간 목록이 포함된다.',
    body:
      '재난안전 점검 2025-0122 임시 제방 월류 위험 하천 공사 구간 보강 ' +
      '취약 구간 목록 호우 대비 점검 확인자 기록',
    concepts: ['점검', '재난', '하천', '현장'],
    weight: 0.88,
  },
  {
    id: 'kn-hsc-guide-ch3',
    title: '민원사무 처리지침 제3장 (처리 기한)',
    baseId: 'kb-hsc-guide',
    security: 'public',
    snippet: '법정 기한과 연장 통지 절차를 정리한 지침 본문.',
    body: '처리 기한 연장 사유 연장 기간 통지 감사 지적 민원 처리 법정 기한',
    concepts: ['기한', '연장', '지침', '처리'],
    weight: 0.74,
  },
  {
    id: 'kn-hsc-ord-0044',
    title: '유권해석 2025-0044 (반복 민원 종결 요건)',
    baseId: 'kb-hsc-ordinance',
    security: 'public',
    snippet: '같은 내용이 3회 이상 반복될 때의 종결 요건과 사전 안내 의무를 다룬 해석.',
    body: '유권해석 2025-0044 반복 민원 3회 종결 사전 서면 안내 민원 처리에 관한 법률',
    concepts: ['민원', '종결', '반복', '법령'],
    weight: 0.8,
  },
]
