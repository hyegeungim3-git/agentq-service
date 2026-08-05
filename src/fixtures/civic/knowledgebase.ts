/**
 * 행정(한성시청) 지식 영역 · 색인 상태.
 *
 * 지식 영역은 **색인과 권한의 단위**다. 지식 검색이 뒤지는 묶음과는 축이 다르다 —
 * 저기는 무엇을 찾는가, 여기는 그게 실제로 찾아지는가와 누가 볼 수 있는가다.
 *
 * ⚠️ **재난·안전 영역에 못 찾는 문서를 뒀다.** 호우 대비가 이 팩의 세계관이라,
 * 하필 그 판단에 쓰는 문서가 검색에 안 잡히는 상태다 — 챗봇은 '그런 문서 없다'고
 * 답한다. 오류가 안 나서 아무도 모른다.
 */
import type { IndexEntry, KnowledgeArea } from '@entities/knowledgebase/model'

export const CIVIC_AREAS: KnowledgeArea[] = [
  {
    id: 'k-hsc-civil',
    name: '민원 처리 대장·사례',
    purpose: '접수·처리·회신 기록과 처리 사례',
    security: 'internal',
    registered: 2_410,
    searchable: 2_410,
    lastIndexedAt: '2026-08-02 03:40',
    staleCount: 0,
  },
  {
    id: 'k-hsc-rule',
    name: '조례·처리지침',
    purpose: '자치법규, 민원사무 처리지침, 위임전결 규정',
    security: 'public',
    registered: 187,
    searchable: 181,
    lastIndexedAt: '2026-08-02 03:40',
    staleCount: 4,
  },
  {
    id: 'k-hsc-safety',
    name: '재난·안전 매뉴얼',
    purpose: '풍수해 행동 매뉴얼, 상황보고 서식, 취약 구간 점검표',
    security: 'internal',
    registered: 74,
    searchable: 66,
    lastIndexedAt: '2026-08-02 03:40',
    staleCount: 3,
  },
  {
    id: 'k-hsc-ad',
    name: '옥외광고물 점검 자료',
    purpose: '표시 신고, 점검 결과, 계고·이행 기록',
    security: 'internal',
    registered: 512,
    searchable: 512,
    lastIndexedAt: '2026-08-02 03:40',
    staleCount: 0,
  },
  {
    id: 'k-hsc-form',
    name: '신청서 원본',
    purpose: '주민이 제출한 신청서 스캔본 — 개인정보가 들어 있다',
    security: 'confidential',
    registered: 3_980,
    searchable: 3_980,
    lastIndexedAt: '2026-08-02 03:40',
    staleCount: 0,
  },
  {
    id: 'k-hsc-open',
    name: '시민 공개 자료',
    purpose: '홈페이지에 올리는 안내문·서식',
    security: 'public',
    registered: 133,
    searchable: 133,
    lastIndexedAt: '2026-08-02 03:40',
    staleCount: 0,
  },
]

/** 목록엔 있는데 검색엔 안 잡히는 문서 — 왜 그런지까지 적는다 */
export const CIVIC_INDEX_ENTRIES: IndexEntry[] = [
  {
    id: 'i-hsc-1',
    areaId: 'k-hsc-safety',
    title: '강변동 취약 구간 점검표 (2026 개정)',
    state: 'failed',
    reason:
      '도면이 스캔 이미지라 글자를 뽑지 못했습니다. 호우 관련 질문에 이 문서가 근거로 안 잡힙니다.',
    updatedOn: '2026-07-18',
  },
  {
    id: 'i-hsc-2',
    areaId: 'k-hsc-safety',
    title: '풍수해 비상 2단계 행동 매뉴얼 부록',
    state: 'failed',
    reason: '한글 파일이 암호로 잠겨 있습니다.',
    updatedOn: '2026-07-22',
  },
  {
    id: 'i-hsc-3',
    areaId: 'k-hsc-safety',
    title: '2026 하반기 재난 대응 교육 자료',
    state: 'pending',
    reason: '색인 대기 중입니다. 다음 색인은 매일 03:40입니다.',
    updatedOn: '2026-08-01',
  },
  {
    id: 'i-hsc-4',
    areaId: 'k-hsc-safety',
    title: '상황보고 서식 개정 초안',
    state: 'skipped',
    reason: '초안 문서라 색인에서 제외했습니다. 확정되면 자동으로 들어갑니다.',
    updatedOn: '2026-07-29',
  },
  {
    id: 'i-hsc-5',
    areaId: 'k-hsc-safety',
    title: '2025 안전관리 계획(폐지)',
    state: 'skipped',
    reason: '폐지 문서로 표시돼 검색에서 뺐습니다.',
    updatedOn: '2025-12-30',
  },
  {
    id: 'i-hsc-6',
    areaId: 'k-hsc-rule',
    title: '옥외광고물 조례 개정안(입법예고)',
    state: 'pending',
    reason: '색인 대기 중입니다.',
    updatedOn: '2026-08-02',
  },
  {
    id: 'i-hsc-7',
    areaId: 'k-hsc-rule',
    title: '위임전결 규정 별표 묶음',
    state: 'failed',
    reason: '표가 많아 변환 중 시간이 초과됐습니다. 나눠서 다시 넣어야 합니다.',
    updatedOn: '2026-07-26',
  },
  {
    id: 'i-hsc-8',
    areaId: 'k-hsc-rule',
    title: '부서 내부 검토 의견(공개 전)',
    state: 'skipped',
    reason: '공개 전 문서로 지정돼 검색에서 뺐습니다.',
    updatedOn: '2026-06-11',
  },
]
