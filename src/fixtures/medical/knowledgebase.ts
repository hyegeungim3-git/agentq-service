/**
 * 의료(새빛대학교병원) 지식 영역 · 색인 상태.
 *
 * 지식 영역은 **색인과 권한의 단위**다. 지식 검색이 뒤지는 묶음과는 축이 다르다 —
 * 저기는 무엇을 찾는가, 여기는 그게 실제로 찾아지는가와 누가 볼 수 있는가다.
 *
 * ⚠️ 진료 정보는 대외비로 두고 **목적 외 사용을 막는 것이 기본**이다. 여기 적는
 * 것은 영역 이름과 건수뿐이며, 환자를 특정할 수 있는 내용은 넣지 않는다.
 *
 * ⚠️ **급여 기준 영역에 못 찾는 문서를 뒀다.** 기준이 검색에 안 잡히면 챗봇은
 * '그런 기준 없다'고 답하고, 그 답을 믿고 청구하면 삭감으로 돌아온다.
 */
import type { IndexEntry, KnowledgeArea } from '@entities/knowledgebase/model'

export const MEDICAL_AREAS: KnowledgeArea[] = [
  {
    id: 'k-suh-guide',
    name: '심사지침·급여 기준',
    purpose: '청구 심사지침, 급여 기준 고시, 산정 지침',
    security: 'internal',
    registered: 214,
    searchable: 203,
    lastIndexedAt: '2026-08-02 03:30',
    staleCount: 6,
  },
  {
    id: 'k-suh-adjust',
    name: '조정 사례집',
    purpose: '조정 사유별 사례와 보완·이의신청 결과',
    security: 'internal',
    registered: 4_820,
    searchable: 4_820,
    lastIndexedAt: '2026-08-02 03:30',
    staleCount: 0,
  },
  {
    id: 'k-suh-notice',
    name: '고시·행정해석',
    purpose: '급여 고시, 행정해석, 관련 법령',
    security: 'public',
    registered: 1_180,
    searchable: 1_174,
    lastIndexedAt: '2026-08-02 03:30',
    staleCount: 2,
  },
  {
    id: 'k-suh-record',
    name: '진료 기록',
    purpose: '청구 근거가 되는 진료 기록 — 목적 외 사용을 막는다',
    security: 'confidential',
    registered: 18_400,
    searchable: 18_400,
    lastIndexedAt: '2026-08-02 03:30',
    staleCount: 0,
  },
  {
    id: 'k-suh-safety',
    name: '환자안전 보고',
    purpose: '보고 사례, 개선 활동, 재발 방지 대책',
    security: 'internal',
    registered: 268,
    searchable: 268,
    lastIndexedAt: '2026-08-02 03:30',
    staleCount: 0,
  },
  {
    id: 'k-suh-share',
    name: '협력기관 공유 자료',
    purpose: '의뢰·회송 기관에 열어 주는 서식·안내',
    security: 'public',
    registered: 62,
    searchable: 62,
    lastIndexedAt: '2026-08-02 03:30',
    staleCount: 0,
  },
]

/** 목록엔 있는데 검색엔 안 잡히는 문서 — 왜 그런지까지 적는다 */
export const MEDICAL_INDEX_ENTRIES: IndexEntry[] = [
  {
    id: 'i-suh-1',
    areaId: 'k-suh-guide',
    title: '급여 기준 고시 별표 2026-07 개정분',
    state: 'failed',
    reason:
      '별표가 이미지로 들어 있어 글자를 뽑지 못했습니다. 개정된 기준이 검색에 안 잡힙니다.',
    updatedOn: '2026-07-14',
  },
  {
    id: 'i-suh-2',
    areaId: 'k-suh-guide',
    title: '항목별 산정 지침 v5',
    state: 'failed',
    reason: '한글 파일이 암호로 잠겨 있습니다.',
    updatedOn: '2026-07-23',
  },
  {
    id: 'i-suh-3',
    areaId: 'k-suh-guide',
    title: '2026 하반기 청구 담당자 교육 자료',
    state: 'pending',
    reason: '색인 대기 중입니다. 다음 색인은 매일 03:30입니다.',
    updatedOn: '2026-08-01',
  },
  {
    id: 'i-suh-4',
    areaId: 'k-suh-guide',
    title: '사전점검 항목 개정 초안',
    state: 'skipped',
    reason: '초안 문서라 색인에서 제외했습니다. 확정되면 자동으로 들어갑니다.',
    updatedOn: '2026-07-28',
  },
  {
    id: 'i-suh-5',
    areaId: 'k-suh-guide',
    title: '2024 심사지침(폐지)',
    state: 'skipped',
    reason: '폐지 문서로 표시돼 검색에서 뺐습니다.',
    updatedOn: '2024-12-31',
  },
  {
    id: 'i-suh-6',
    areaId: 'k-suh-notice',
    title: '행정해석 회신 묶음 2026-07',
    state: 'pending',
    reason: '색인 대기 중입니다.',
    updatedOn: '2026-08-02',
  },
  {
    id: 'i-suh-7',
    areaId: 'k-suh-notice',
    title: '고시 개정 대비표 (전체)',
    state: 'failed',
    reason: '파일이 200MB를 넘어 처리하지 못했습니다. 연도별로 나눠 넣어야 합니다.',
    updatedOn: '2026-07-31',
  },
  {
    id: 'i-suh-8',
    areaId: 'k-suh-notice',
    title: '내부 검토 의견(공개 전)',
    state: 'skipped',
    reason: '공개 전 문서로 지정돼 검색에서 뺐습니다.',
    updatedOn: '2026-06-20',
  },
]
