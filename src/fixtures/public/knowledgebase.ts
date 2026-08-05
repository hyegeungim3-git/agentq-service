/**
 * 공공(한국부동산원) 지식 영역 · 색인 상태.
 *
 * 지식 영역은 **색인과 권한의 단위**다. 지식 검색 에이전트가 뒤지는
 * 검색 묶음(`public/knowledge.ts`)과는 축이 다르다 — 저기는 무엇을 찾는가,
 * 여기는 그게 실제로 찾아지는가와 누가 볼 수 있는가다.
 *
 * ⚠️ **못 찾는 문서를 일부러 넣었다.** 전부 색인돼 있으면 '등록됐는데 검색에 안
 * 잡힌다'를 보여 주는 화면이 죽은 코드가 된다. 오류가 안 나기 때문에 화면이
 * 말하지 않으면 아무도 모르고, 사용자는 '그런 문서 없다'는 답을 받는다.
 */
import type { IndexEntry, KnowledgeArea } from '@entities/knowledgebase/model'

export const PUBLIC_AREAS: KnowledgeArea[] = [
  {
    id: 'k-reb-parcel',
    name: '표준지 조사 자료',
    purpose: '조사표, 산정 근거, 특성 조사 기록',
    security: 'confidential',
    registered: 1_284,
    searchable: 1_284,
    lastIndexedAt: '2026-08-02 03:20',
    staleCount: 0,
  },
  {
    id: 'k-reb-guide',
    name: '조사지침·업무규정',
    purpose: '표준지 조사지침, 이의신청 처리 규정',
    security: 'internal',
    registered: 96,
    searchable: 89,
    lastIndexedAt: '2026-08-02 03:20',
    staleCount: 5,
  },
  {
    id: 'k-reb-law',
    name: '법령·행정해석',
    purpose: '부동산공시법, 거래신고법, 유권해석',
    security: 'public',
    registered: 412,
    searchable: 404,
    lastIndexedAt: '2026-08-02 03:20',
    staleCount: 3,
  },
  {
    id: 'k-reb-appeal',
    name: '이의신청 처리 사례',
    purpose: '접수·검토·회신 사례와 판단 근거',
    security: 'internal',
    registered: 233,
    searchable: 233,
    lastIndexedAt: '2026-08-02 03:20',
    staleCount: 0,
  },
  {
    id: 'k-reb-rtms',
    name: '실거래 신고 자료',
    purpose: '신고 내역, 검증 대장, 의심 거래 판정 근거',
    security: 'confidential',
    registered: 1_842,
    searchable: 1_842,
    lastIndexedAt: '2026-08-02 03:20',
    staleCount: 0,
  },
  {
    id: 'k-reb-share',
    name: '수탁기관 공유 문서',
    purpose: '조사 수탁기관에 열어 주는 서식·기준',
    security: 'public',
    registered: 58,
    searchable: 58,
    lastIndexedAt: '2026-08-02 03:20',
    staleCount: 0,
  },
]

/** 목록엔 있는데 검색엔 안 잡히는 문서 — 왜 그런지까지 적는다 */
export const PUBLIC_INDEX_ENTRIES: IndexEntry[] = [
  {
    id: 'i-reb-1',
    areaId: 'k-reb-guide',
    title: '표준지 조사지침 2026 개정본 부록(별표)',
    state: 'failed',
    reason: '별표가 이미지로 들어 있어 글자를 뽑지 못했습니다. 문서 인식을 거쳐 다시 넣어야 합니다.',
    updatedOn: '2026-07-12',
  },
  {
    id: 'i-reb-2',
    areaId: 'k-reb-guide',
    title: '이의신청 처리 매뉴얼 v3',
    state: 'failed',
    reason: '한글 파일이 암호로 잠겨 있습니다.',
    updatedOn: '2026-07-21',
  },
  {
    id: 'i-reb-3',
    areaId: 'k-reb-guide',
    title: '2026 하반기 조사원 교육 자료',
    state: 'pending',
    reason: '색인 대기 중입니다. 다음 색인은 매일 03:20입니다.',
    updatedOn: '2026-08-01',
  },
  {
    id: 'i-reb-4',
    areaId: 'k-reb-guide',
    title: '조사표 서식 개정 초안',
    state: 'skipped',
    reason: '초안 문서라 색인에서 제외했습니다. 확정되면 자동으로 들어갑니다.',
    updatedOn: '2026-07-30',
  },
  {
    id: 'i-reb-5',
    areaId: 'k-reb-guide',
    title: '2025 조사지침(폐지)',
    state: 'skipped',
    reason: '폐지 문서로 표시돼 검색에서 뺐습니다.',
    updatedOn: '2025-12-31',
  },
  {
    id: 'i-reb-6',
    areaId: 'k-reb-law',
    title: '거래신고법 시행규칙 개정안(입법예고)',
    state: 'pending',
    reason: '색인 대기 중입니다.',
    updatedOn: '2026-08-02',
  },
  {
    id: 'i-reb-7',
    areaId: 'k-reb-law',
    title: '유권해석 회신 묶음 2026-07',
    state: 'failed',
    reason: '파일이 200MB를 넘어 처리하지 못했습니다.',
    updatedOn: '2026-07-31',
  },
  {
    id: 'i-reb-8',
    areaId: 'k-reb-law',
    title: '지자체 질의 회신(공개 전)',
    state: 'skipped',
    reason: '공개 전 문서로 지정돼 검색에서 뺐습니다.',
    updatedOn: '2026-06-24',
  },
]
