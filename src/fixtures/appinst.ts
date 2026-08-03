/**
 * 앱 인스턴스 · RAG 파이프라인 fixture.
 *
 * 파이프라인 숫자는 **지식 관리 화면과 맞아야 한다.** 안전·환경 영역은 등록 64건 중
 * 58건이 검색되고 6건이 못 찾는 상태다 — 여기서는 그 6건이 **어느 단계에서
 * 떨어졌는지**를 보여 준다. 두 화면의 숫자가 어긋나면 어느 쪽이 사실인지 알 수 없다.
 *
 * 앱은 내려가 있는 것과 아무도 안 쓰는 것을 각각 넣었다. 전부 잘 돌면
 * 그걸 드러내는 화면이 죽은 코드가 된다.
 */
import type { AppInstance, PipelineRun } from '@entities/appinst/model'

export const APP_INSTANCES: AppInstance[] = [
  { id: 'a-1663', title: '프레스 작업표준 상담 봇', kind: 'chat', live: true, downReason: null, owner: '박태윤', group: '생산기술팀', uses7d: 284, createdOn: '2026-03-11', areaIds: ['k-sop'] },
  { id: 'a-1662', title: '수입검사 문의 봇', kind: 'chat', live: true, downReason: null, owner: '정하늘', group: '품질보증팀', uses7d: 176, createdOn: '2026-03-20', areaIds: ['k-quality'] },
  { id: 'a-1661', title: '내규 Q&A 봇', kind: 'chat', live: true, downReason: null, owner: '서민아', group: '경영지원팀', uses7d: 92, createdOn: '2026-04-02', areaIds: ['k-reg'] },
  /* 내려가 있다 — 왜 내렸는지 없으면 다시 올려도 되는지 모른다 */
  { id: 'a-1655', title: '안전작업 안내 봇 (시범)', kind: 'chat', live: false, downReason: '안전 문서 색인이 끝나지 않아 답이 부실해 내렸습니다. 지식 관리에서 6건이 아직 색인 실패입니다.', owner: '오세진', group: '설비보전팀', uses7d: 0, createdOn: '2026-06-15', areaIds: ['k-safety'] },
  { id: 'a-1650', title: '설비 이력 조회 봇', kind: 'chat', live: true, downReason: null, owner: '오세진', group: '설비보전팀', uses7d: 61, createdOn: '2026-05-08', areaIds: ['k-equip'] },
  { id: 'a-1620', title: '품질 주간보고 생성기', kind: 'report', live: true, downReason: null, owner: '정하늘', group: '품질보증팀', uses7d: 24, createdOn: '2026-02-27', areaIds: ['k-quality'] },
  { id: 'a-1618', title: '생산 실적 보고서', kind: 'report', live: true, downReason: null, owner: '박태윤', group: '생산기술팀', uses7d: 18, createdOn: '2026-03-04', areaIds: ['k-equip'] },
  /* 만들어 두고 아무도 안 쓴다 */
  { id: 'a-1610', title: '협력사 납품 실적 리포트', kind: 'report', live: true, downReason: null, owner: '서민아', group: '경영지원팀', uses7d: 0, createdOn: '2026-01-19', areaIds: [] },
  { id: 'a-1590', title: '불량률 추이 분석', kind: 'analysis', live: true, downReason: null, owner: '정하늘', group: '품질보증팀', uses7d: 37, createdOn: '2026-02-10', areaIds: ['k-quality'] },
  { id: 'a-1585', title: '열처리 온도 편차 분석', kind: 'analysis', live: true, downReason: null, owner: '박태윤', group: '생산기술팀', uses7d: 12, createdOn: '2026-04-22', areaIds: ['k-equip'] },
  { id: 'a-1580', title: '예지보전 진동 분석', kind: 'analysis', live: false, downReason: 'PdM 센서 조회 도구가 끊겨 결과가 비어 나옵니다. 도구·배포에서 확인하십시오.', owner: '오세진', group: '설비보전팀', uses7d: 0, createdOn: '2026-05-30', areaIds: ['k-equip'] },
]

/**
 * 색인 파이프라인 실행 기록.
 *
 * 안전·환경 영역: 등록 64건 → 58건 검색 가능. 떨어진 6건이 어느 단계에서
 * 걸렸는지 여기 있다(본문 추출 2 · 청킹 1 · 색인 3). 지식 관리의 '못 찾는 문서'
 * 목록과 같은 사건이다.
 */
export const PIPELINE_RUNS: PipelineRun[] = [
  {
    id: 'run-safety',
    areaId: 'k-safety',
    areaName: '안전·환경',
    startedAt: '2026-07-28 03:10',
    finishedAt: '2026-07-28 03:24',
    stages: [
      { stage: 'collect', incoming: 64, out: 64, drops: [] },
      {
        stage: 'extract',
        incoming: 64,
        out: 62,
        drops: [
          { reason: '스캔 이미지라 글자를 뽑지 못함', count: 1 },
          { reason: '암호로 잠긴 파일', count: 1 },
        ],
      },
      { stage: 'chunk', incoming: 62, out: 61, drops: [{ reason: '본문이 비어 청크를 못 만듦', count: 1 }] },
      { stage: 'embed', incoming: 61, out: 61, drops: [] },
      {
        stage: 'index',
        incoming: 61,
        out: 58,
        drops: [
          { reason: '초안·폐기 표시로 제외', count: 2 },
          { reason: '양식 파일로 제외', count: 1 },
        ],
      },
    ],
  },
  {
    id: 'run-quality',
    areaId: 'k-quality',
    areaName: '품질 기준·성적서',
    startedAt: '2026-08-02 03:10',
    finishedAt: '2026-08-02 03:41',
    stages: [
      { stage: 'collect', incoming: 318, out: 318, drops: [] },
      {
        stage: 'extract',
        incoming: 318,
        out: 316,
        drops: [
          { reason: '파일이 200MB를 넘음', count: 1 },
          { reason: '인식률이 기준 아래', count: 1 },
        ],
      },
      { stage: 'chunk', incoming: 316, out: 316, drops: [] },
      { stage: 'embed', incoming: 316, out: 314, drops: [{ reason: '색인 대기(다음 실행에서 처리)', count: 2 }] },
      { stage: 'index', incoming: 314, out: 311, drops: [{ reason: '대외 공개 금지·구버전으로 제외', count: 3 }] },
    ],
  },
  {
    /* 아직 안 끝났다 — 끝난 것처럼 보이면 안 된다 */
    id: 'run-sop',
    areaId: 'k-sop',
    areaName: '작업표준·공정 문서',
    startedAt: '2026-08-02 03:10',
    finishedAt: null,
    stages: [
      { stage: 'collect', incoming: 142, out: 142, drops: [] },
      { stage: 'extract', incoming: 142, out: 142, drops: [] },
      { stage: 'chunk', incoming: 142, out: 142, drops: [] },
      { stage: 'embed', incoming: 142, out: 120, drops: [] },
      { stage: 'index', incoming: 120, out: 120, drops: [] },
    ],
  },
]
