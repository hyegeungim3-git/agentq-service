/**
 * 지식 검색 fixture.
 *
 * 1위 도면이 왜 1위이고 2위가 왜 밀렸는지가 속성 대조에서 드러나야 한다.
 * 전부 일치시키면 '왜 유사한가'를 보여 주는 화면이 죽은 코드가 된다.
 */
import type { KnowledgeResult } from '@entities/knowledge/model'

export const KNOWLEDGE_RESULT: KnowledgeResult = {
  documentId: 'doc-press-sop',
  indexedCount: 12_400,
  elapsedSeconds: 4.7,
  hits: [
    {
      id: 'k-1',
      code: 'HBM-2211',
      name: '브래킷 굽힘 금형 (SPCC 2.0T)',
      year: 2024,
      similarity: 0.92,
      attributes: [
        { label: '소재', queryValue: 'SPCC 2.0T', candidateValue: 'SPCC 2.0T', matched: true },
        { label: '굽힘 R', queryValue: 'R3.0', candidateValue: 'R3.0', matched: true },
        { label: '전장', queryValue: '84.5mm', candidateValue: '84.5mm', matched: true },
        { label: '홀 피치', queryValue: '38.5mm', candidateValue: '42.0mm', matched: false },
        { label: '스테이지', queryValue: '5', candidateValue: '5', matched: true },
        { label: '프레스 톤수', queryValue: '200t', candidateValue: '200t', matched: true },
      ],
      reusable: ['스트립 레이아웃', '다이 클리어런스 세트', '냉각 채널 배치'],
    },
    {
      id: 'k-2',
      code: 'HBM-1987',
      name: '브래킷 굽힘 금형 (SPCC 1.6T)',
      year: 2023,
      similarity: 0.81,
      attributes: [
        // 소재 두께가 달라 밀렸다 — 1위와의 차이가 여기서 드러나야 한다
        { label: '소재', queryValue: 'SPCC 2.0T', candidateValue: 'SPCC 1.6T', matched: false },
        { label: '굽힘 R', queryValue: 'R3.0', candidateValue: 'R2.5', matched: false },
        { label: '전장', queryValue: '84.5mm', candidateValue: '84.5mm', matched: true },
        { label: '홀 피치', queryValue: '38.5mm', candidateValue: '38.5mm', matched: true },
        { label: '스테이지', queryValue: '5', candidateValue: '5', matched: true },
        { label: '프레스 톤수', queryValue: '200t', candidateValue: '200t', matched: true },
      ],
      reusable: ['패드 압력 개선 이력 (0.8 → 1.2MPa)'],
    },
    {
      id: 'k-3',
      code: 'HBM-1642',
      name: '스티프너 성형 금형',
      year: 2022,
      similarity: 0.74,
      attributes: [
        { label: '소재', queryValue: 'SPCC 2.0T', candidateValue: 'SPCC 2.0T', matched: true },
        { label: '굽힘 R', queryValue: 'R3.0', candidateValue: 'R5.0', matched: false },
        { label: '전장', queryValue: '84.5mm', candidateValue: '112.0mm', matched: false },
        { label: '홀 피치', queryValue: '38.5mm', candidateValue: '50.0mm', matched: false },
        { label: '스테이지', queryValue: '5', candidateValue: '4', matched: false },
        { label: '프레스 톤수', queryValue: '200t', candidateValue: '200t', matched: true },
      ],
      reusable: ['스트리퍼 구조'],
    },
  ],
}
