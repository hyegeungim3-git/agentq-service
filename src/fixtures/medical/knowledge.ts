/**
 * 의료(새빛대학교병원) 지식 검색.
 *
 * 제조가 '유사 도면', 공공이 '유사 표준지', 행정이 '유사 민원'이라면
 * 여기는 **유사 조정 사례**다. 심사에서 조정된 건을 찾아 어떻게 보완했는지 본다.
 *
 * 앞선 팩들과 같은 규칙: 1위가 왜 1위인지 속성 대조에서 드러나야 하고,
 * 대외비를 섞어 보안 필터가 실제로 무언가를 거를 수 있어야 한다.
 *
 * ⚠️ 사례는 **항목·근거 수준**으로만 적는다. 환자를 특정할 수 있는 내용을 넣지 않는다.
 */
import type { KnowledgeBase } from '@entities/knowledge/model'
import type { CorpusItem } from '../knowledge'

export const MEDICAL_KNOWLEDGE_BASES: KnowledgeBase[] = [
  { id: 'kb-suh-adjust', name: '심사 조정 사례집', docCount: 4_820, updatedAt: '2026-03-22' },
  { id: 'kb-suh-guide', name: '청구·심사 지침', docCount: 46, updatedAt: '2026-01-12' },
  { id: 'kb-suh-notice', name: '급여 고시·행정해석', docCount: 1_180, updatedAt: '2026-03-05' },
  { id: 'kb-suh-bed', name: '병상 운영 기록', docCount: 312, updatedAt: '2026-03-24' },
  { id: 'kb-suh-safety', name: '환자안전 보고 사례', docCount: 268, updatedAt: '2026-03-18' },
]

/** 진행 중인 보완 건 — 후보를 무엇과 견주는지 화면이 밝혀야 한다 */
export const MEDICAL_REFERENCE_SPEC = '보완 진행 중 A-2026-0214 (기준 초과 투여)'

export const MEDICAL_CORPUS: CorpusItem[] = [
  {
    id: 'kn-suh-2025-2214',
    title: '조정 사례 2025-2214 (기준 초과 투여 — 근거 보완 인정)',
    baseId: 'kb-suh-adjust',
    security: 'internal',
    snippet:
      '급여 기준을 초과해 투여한 건으로, 진료기록에 필요성을 보완해 이의신청이 인정된 사례.',
    body:
      '조정 2025-2214 기준 초과 투여 진료기록 필요성 보완 이의신청 인정 ' +
      '요양급여 기준 규칙 제5조 심사지침 제3장 근거 기재',
    concepts: ['조정', '기록', '근거', '투여', '이의신청'],
    weight: 0.95,
    drawing: {
      code: '2025-2214',
      year: 2025,
      attributes: [
        { label: '조정 사유', queryValue: '기준 초과 투여', candidateValue: '기준 초과 투여', matched: true },
        { label: '보완 방식', queryValue: '진료기록 기재', candidateValue: '진료기록 기재', matched: true },
        { label: '적용 근거', queryValue: '규칙 제5조', candidateValue: '규칙 제5조', matched: true },
        { label: '진료 구분', queryValue: '입원', candidateValue: '외래', matched: false },
        { label: '이의신청', queryValue: '예정', candidateValue: '인정', matched: true },
        { label: '처리 기간', queryValue: '30일', candidateValue: '27일', matched: true },
      ],
      reusable: ['필요성 기재 문안', '이의신청 근거 자료 목록', '진료과 확인 요청 서식'],
    },
  },
  {
    id: 'kn-suh-2024-1877',
    title: '조정 사례 2024-1877 (재료대 별도 산정 착오)',
    baseId: 'kb-suh-adjust',
    security: 'internal',
    snippet: '조정 사유가 달라 그대로 견주기 어렵다. 별도 산정 가능 여부 대조표가 남아 있다.',
    body:
      '조정 2024-1877 재료대 별도 산정 착오 고시 대조 정정 청구 ' +
      '외래 처리 기간 21일 이의신청 미제기',
    concepts: ['조정', '재료대', '산정', '고시'],
    weight: 0.74,
    drawing: {
      code: '2024-1877',
      year: 2024,
      attributes: [
        { label: '조정 사유', queryValue: '기준 초과 투여', candidateValue: '재료대 착오', matched: false },
        { label: '보완 방식', queryValue: '진료기록 기재', candidateValue: '정정 청구', matched: false },
        { label: '적용 근거', queryValue: '규칙 제5조', candidateValue: '급여 고시', matched: false },
        { label: '진료 구분', queryValue: '입원', candidateValue: '외래', matched: false },
        { label: '이의신청', queryValue: '예정', candidateValue: '미제기', matched: false },
        { label: '처리 기간', queryValue: '30일', candidateValue: '21일', matched: true },
      ],
      reusable: ['별도 산정 가능 여부 대조표'],
    },
  },
  {
    id: 'kn-suh-notice-0912',
    title: '행정해석 2025-0912 (응급증상 판단 근거 기재 범위)',
    baseId: 'kb-suh-notice',
    security: 'public',
    snippet: '응급 산정 시 진료기록에 남겨야 하는 판단 근거의 범위를 다룬 해석.',
    body:
      '행정해석 2025-0912 응급증상 판단 근거 기재 범위 응급의료에 관한 법률 ' +
      '산정 기준 진료기록 필수 기재 항목',
    concepts: ['응급', '근거', '기록', '법령'],
    weight: 0.86,
  },
  {
    id: 'kn-suh-bed-0148',
    title: '병상 운영 기록 2025-0148 (과밀 시 대기 병상 조정)',
    baseId: 'kb-suh-bed',
    /* 대외비 — 보안 등급 필터가 실제로 무언가를 거를 수 있어야 한다 */
    security: 'confidential',
    snippet:
      '응급의료센터 과밀 시 입원 대기 병상을 조정한 사례. 조정 기준과 통보 절차가 정리돼 있다.',
    body:
      '병상 운영 2025-0148 응급의료센터 과밀 입원 대기 병상 조정 기준 ' +
      '가동률 90퍼센트 통보 절차 간호부 협의',
    concepts: ['병상', '가동률', '조정', '응급'],
    weight: 0.88,
  },
  {
    id: 'kn-suh-guide-ch2',
    title: '청구 심사지침 제2장 (사전점검)',
    baseId: 'kb-suh-guide',
    security: 'public',
    snippet: '청구 전 점검 대상 세 항목과 보류 절차를 정리한 지침 본문.',
    body: '사전점검 고가 처치 재료대 급여 기준 초과 투여 진료기록 근거 미비 보류 진료과 확인',
    concepts: ['사전점검', '보류', '지침', '청구'],
    weight: 0.78,
  },
  {
    id: 'kn-suh-safety-0066',
    title: '환자안전 보고 2025-0066 (과밀 시간대 동선 혼잡)',
    baseId: 'kb-suh-safety',
    security: 'internal',
    snippet: '이송 장비와 보행 동선이 교차해 혼잡이 발생한 사례. 유도 인력 배치안이 포함된다.',
    body: '환자안전 2025-0066 과밀 시간대 동선 혼잡 이송 장비 유도 인력 배치 대기 구역 분리',
    concepts: ['안전', '동선', '응급', '배치'],
    weight: 0.8,
  },
]
