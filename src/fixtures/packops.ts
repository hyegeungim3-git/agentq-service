/**
 * 제조 팩의 도구 · 플랫폼 배포 fixture.
 *
 * 팩 현황 표는 여기 없다 — 손으로 적어 뒀더니 포털과 갈라져서
 * 레지스트리(`fixtures/packs`)에서 뽑도록 바꿨다.
 *
 * **도구는 발주처 데이터다.** 다른 팩은 자기 폴더에 자기 도구를 갖는다.
 * 여기 있는 것은 제조(한빛정밀)의 도구이며, 제조가 기본 팩이라 루트에 남아 있다.
 *
 * 끊긴 도구를 하나 넣었다 — 도구는 끊겨도 서비스가 죽지 않아서
 * '어떤 에이전트가 조용히 못 도는지'를 보여 주는 화면이 필요하다.
 *
 * ⚠️ **사용처(`usedBy`)는 여기 없다.** 손으로 적었더니 실제와 어긋났다 —
 * 안전관리계획이 지식 검색을 부르는데 그 목록에는 없었다. 정의에서 유도한다.
 *
 * 배포는 발주처별이 아니다 — 플랫폼이 한 번 올리면 모든 발주처가 그 버전을 쓴다.
 */
import type { Deployment, ToolSpec } from '@entities/packops/model'

export const TOOLS: ToolSpec[] = [
  { id: 't-rag', name: '지식 검색', kind: 'search', connected: true, downReason: null, calls7d: 1_284 },
  { id: 't-mes', name: 'MES 조회', kind: 'db', connected: true, downReason: null, calls7d: 312 },
  { id: 't-ocr', name: '문서 텍스트 추출', kind: 'file', connected: true, downReason: null, calls7d: 208 },
  { id: 't-stt', name: '음성 인식', kind: 'file', connected: true, downReason: null, calls7d: 64 },
  /* 끊긴 도구 — 이걸 쓰는 에이전트만 조용히 못 돈다 */
  {
    id: 't-pdm',
    name: 'PdM 센서 조회',
    kind: 'external',
    connected: false,
    downReason: '수집기 게이트웨이가 응답하지 않습니다 — 연계 SW 모니터링의 PdM 진동 수집기와 같은 원인입니다.',
    calls7d: 12,
  },
  { id: 't-erp', name: 'ERP 조회', kind: 'external', connected: true, downReason: null, calls7d: 41 },
]

/**
 * 배포.
 *
 * 검증에만 올라간 버전을 넣었다. 검증과 운영이 같은 버전이면 '무엇이 아직
 * 안 나갔는지' 보여 주는 화면이 죽은 코드가 된다.
 */
export const DEPLOYMENTS: Deployment[] = [
  { id: 'd-1', target: '사용자 포털', stage: 'production', version: 'v1.8.2', deployedAt: '2026-07-28 10:20', note: null },
  { id: 'd-2', target: '사용자 포털', stage: 'staging', version: 'v1.9.0', deployedAt: '2026-08-01 16:05', note: '지도 인텔리전스와 환경설정이 들어간 버전입니다.' },
  { id: 'd-3', target: '관리자 시스템', stage: 'production', version: 'v1.4.0', deployedAt: '2026-07-30 09:00', note: null },
  { id: 'd-4', target: '관리자 시스템', stage: 'staging', version: 'v1.4.0', deployedAt: '2026-07-30 08:30', note: null },
  { id: 'd-5', target: '에이전트 실행기', stage: 'production', version: 'v0.9.3', deployedAt: '2026-07-22 14:40', note: '베타입니다. 외부 시스템에 붙이지 마십시오.' },
  { id: 'd-6', target: '에이전트 실행기', stage: 'staging', version: 'v0.9.5', deployedAt: '2026-08-02 07:10', note: null },
  /* 에이전트 정의도 배포 대상이다 — 이전 데모의 '태스크플로우 배포'가 이것이다.
     정의가 바뀌면 답이 달라지므로 검증에서 확인한 뒤 운영에 올린다 */
  { id: 'd-7', target: '에이전트 정의', stage: 'production', version: 'def-2026-07-18', deployedAt: '2026-07-18 15:00', note: '태스크플로우 빌더에서 보는 정의의 운영 버전입니다. 발주처별 정의를 함께 올립니다.' },
  { id: 'd-8', target: '에이전트 정의', stage: 'staging', version: 'def-2026-08-02', deployedAt: '2026-08-02 09:20', note: '안전관리계획에 사람 확인 지점을 넣은 버전입니다. 아직 운영에 안 나갔습니다.' },
]
