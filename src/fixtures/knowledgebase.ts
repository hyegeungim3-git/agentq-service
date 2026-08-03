/**
 * 지식 관리 fixture.
 *
 * 세계관은 한빛정밀이다. 지식영역은 사용자 포털의 지식 검색·챗봇이 실제로 뒤지는
 * 곳이고, 대외비 영역은 협력사 계정이 접근에서 거부된 그 문서들이다.
 *
 * **못 찾는 문서를 일부러 넣었다.** 전부 색인돼 있으면 '등록됐는데 검색에 안
 * 잡힌다'를 보여 주는 화면이 죽은 코드가 된다. 실제로 이게 가장 흔한 사고다 —
 * 오류가 안 나서 아무도 모르고, 사용자는 '그런 문서 없다'는 답을 받는다.
 *
 * 챗봇이 대피 경로를 지어낸 사건(품질 관리의 할루시네이션 판정)의 원인도
 * 여기 있다 — 안전 문서 영역에 대피도가 색인 실패로 빠져 있다.
 */
import type { IndexEntry, KnowledgeArea, RagConfig } from '@entities/knowledgebase/model'

export const AREAS: KnowledgeArea[] = [
  {
    id: 'k-sop',
    name: '작업표준·공정 문서',
    purpose: '프레스·열처리 SOP와 작업지시서',
    security: 'confidential',
    registered: 142,
    searchable: 142,
    lastIndexedAt: '2026-08-02 03:10',
    staleCount: 0,
  },
  {
    id: 'k-quality',
    name: '품질 기준·성적서',
    purpose: '수입검사 기준, 성적서, 부적합 보고',
    security: 'internal',
    registered: 318,
    searchable: 311,
    lastIndexedAt: '2026-08-02 03:10',
    staleCount: 4,
  },
  {
    id: 'k-safety',
    name: '안전·환경',
    purpose: '위험성평가, 안전작업허가, 대피 계획',
    security: 'internal',
    /* 대피도가 여기서 빠졌다 — 챗봇이 지어낸 그 질문의 원인 */
    registered: 64,
    searchable: 58,
    lastIndexedAt: '2026-07-28 03:10',
    staleCount: 2,
  },
  {
    id: 'k-reg',
    name: '사내 규정',
    purpose: '취업규칙, 복무·출장 규정',
    security: 'internal',
    registered: 27,
    searchable: 27,
    lastIndexedAt: '2026-08-02 03:10',
    staleCount: 0,
  },
  {
    id: 'k-equip',
    name: '설비 대장·정비 이력',
    purpose: '설비 사양, 정비지시서, 예지보전 기록',
    security: 'internal',
    registered: 205,
    searchable: 205,
    lastIndexedAt: '2026-08-02 03:10',
    staleCount: 11,
  },
  {
    id: 'k-partner',
    name: '협력사 공유 문서',
    purpose: '협력사에 열어 주는 사양·검사 기준',
    security: 'public',
    registered: 41,
    searchable: 41,
    lastIndexedAt: '2026-08-02 03:10',
    staleCount: 0,
  },
]

/** 색인되지 않은 문서 — 목록엔 있는데 검색엔 안 잡힌다 */
export const INDEX_ENTRIES: IndexEntry[] = [
  { id: 'i-1', areaId: 'k-safety', title: '창원본사 3동 비상 대피도 (2026 개정)', state: 'failed', reason: '도면 PDF에서 글자를 뽑지 못했습니다(스캔 이미지). OCR을 거쳐 다시 넣어야 합니다.', updatedOn: '2026-07-15' },
  { id: 'i-2', areaId: 'k-safety', title: '밀폐공간 작업 안전수칙', state: 'failed', reason: '한글 파일이 암호로 잠겨 있습니다.', updatedOn: '2026-07-20' },
  { id: 'i-3', areaId: 'k-safety', title: '2026 상반기 안전교육 자료', state: 'pending', reason: '색인 대기 중입니다. 다음 색인은 매일 03:10입니다.', updatedOn: '2026-08-01' },
  { id: 'i-4', areaId: 'k-safety', title: '위험성평가 개정안 초안', state: 'skipped', reason: '초안 문서라 색인에서 제외했습니다. 확정되면 자동으로 들어갑니다.', updatedOn: '2026-07-31' },
  { id: 'i-5', areaId: 'k-safety', title: '협력사 안전서약서 양식', state: 'skipped', reason: '양식 파일이라 내용 검색 대상이 아닙니다.', updatedOn: '2026-05-02' },
  { id: 'i-6', areaId: 'k-safety', title: '2025 안전보건 계획(폐기)', state: 'skipped', reason: '폐기 문서로 표시돼 검색에서 뺐습니다.', updatedOn: '2025-12-30' },
  { id: 'i-7', areaId: 'k-quality', title: '수입검사 기준서 v4 (개정 중)', state: 'pending', reason: '색인 대기 중입니다.', updatedOn: '2026-08-01' },
  { id: 'i-8', areaId: 'k-quality', title: '부적합 보고 2026-07 묶음', state: 'failed', reason: '파일이 200MB를 넘어 처리하지 못했습니다.', updatedOn: '2026-07-31' },
  { id: 'i-9', areaId: 'k-quality', title: '협력사 품질 감사 결과(대성정공)', state: 'skipped', reason: '대외 공개 금지로 지정돼 검색에서 뺐습니다.', updatedOn: '2026-06-18' },
  { id: 'i-10', areaId: 'k-quality', title: '성적서 스캔본 2026-03 묶음', state: 'failed', reason: '스캔 품질이 낮아 글자 인식률이 기준(70%) 아래입니다.', updatedOn: '2026-03-31' },
  { id: 'i-11', areaId: 'k-quality', title: '품질경영매뉴얼 부록', state: 'pending', reason: '색인 대기 중입니다.', updatedOn: '2026-08-02' },
  { id: 'i-12', areaId: 'k-quality', title: '2024 품질 실적(폐기)', state: 'skipped', reason: '폐기 문서로 표시돼 검색에서 뺐습니다.', updatedOn: '2024-12-31' },
  { id: 'i-13', areaId: 'k-quality', title: '외주 도금 사양서(구버전)', state: 'skipped', reason: '상위 버전이 있어 검색에서 뺐습니다.', updatedOn: '2025-09-10' },
]

/**
 * RAG 설정.
 *
 * 재색인이 84%에서 멈춰 있다 — 옛 설정으로 색인된 문서가 16% 섞여 있다.
 * 오류가 안 나기 때문에 화면이 말하지 않으면 아무도 모른다.
 */
export const RAG_CONFIG: RagConfig = {
  embeddingModel: 'KoE5-large (v2)',
  chunkSize: 800,
  chunkOverlap: 120,
  searchMode: 'hybrid',
  topK: 5,
  reindexedRatio: 0.84,
}
