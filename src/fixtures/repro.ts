/**
 * 답변 재현성 fixture.
 *
 * 세계관은 한빛정밀이다. 스냅샷의 사건은 다른 화면과 이어진다 —
 * 예지보전 진동 알람 질의, 침탄로 경도 규격 질의, 수급업체 안전 평가 질의.
 *
 * **재현 불가를 넣었다.** 전부 재현 가능이면 '무엇이 바뀌어서 못 하는지'를
 * 말하는 자리가 죽은 코드가 된다. 실제로 이 저장소의 다른 화면들이 그 변경을
 * 이미 말하고 있다 — 지식 영역 재색인, 프롬프트 개정.
 *
 * ⚠️ **질의 본문은 넣지 않는다.** `topic`은 분류이지 사용자가 친 문장이 아니다.
 * 본문 보관은 아직 정해지지 않았고(§3-7), 정해지기 전에 fixture가 본문을
 * 들고 있으면 화면이 그것을 그리게 된다.
 */
import type { Snapshot } from '@entities/repro/model'

export const SNAPSHOTS: Snapshot[] = [
  {
    id: 'sn-1',
    at: '2026-07-30 14:22',
    topic: '설비 진동 임계치 기준 조회',
    agentLabel: '업무 챗봇',
    model: 'Llama-3-Korean 70B',
    modelVersion: 'v1.4',
    knowledgeRev: 'kb-2026.07.27',
    promptVersion: 'p-2.1',
    guardrailVersion: 'g-1.8',
    temperature: 0.2,
    sources: [{ name: '설비 예방보전 기준', rev: 'v2 (2026-07-14)' }],
    drift: [],
  },
  {
    id: 'sn-2',
    at: '2026-06-24 09:05',
    topic: '분기 불량률 집계',
    agentLabel: '데이터 조회·분석',
    model: 'GPT-OSS 120B',
    modelVersion: 'v2.2',
    knowledgeRev: 'kb-2026.06.20',
    promptVersion: 'p-2.0',
    guardrailVersion: 'g-1.7',
    temperature: 0.1,
    sources: [{ name: '품질 집계 테이블', rev: '2026-06-24 마감' }],
    drift: [
      { part: 'model', was: 'GPT-OSS 120B v2.2', now: 'GPT-OSS 120B v2.3' },
      { part: 'prompt', was: 'p-2.0', now: 'p-2.1' },
      { part: 'sources', was: '2026-06-24 마감', now: '2026-07-02 재마감' },
    ],
  },
  {
    id: 'sn-3',
    at: '2026-05-11 16:40',
    topic: '수급업체 안전 평가 기준 조회',
    agentLabel: '내규·규정 조회',
    model: 'GPT-OSS 120B',
    modelVersion: 'v2.1',
    knowledgeRev: 'kb-2026.05.05',
    promptVersion: 'p-1.9',
    guardrailVersion: 'g-1.6',
    temperature: 0.3,
    sources: [{ name: '수급업체 안전보건 평가기준', rev: 'v3 (2026-04-30)' }],
    drift: [
      { part: 'knowledge', was: 'kb-2026.05.05', now: 'kb-2026.07.27' },
      { part: 'guardrail', was: 'g-1.6', now: 'g-1.8' },
    ],
  },
  {
    id: 'sn-4',
    at: '2026-07-18 11:03',
    topic: '침탄 열처리 경도 규격 조회',
    agentLabel: '지식 검색',
    model: 'Llama-3-Korean 70B',
    modelVersion: 'v1.4',
    knowledgeRev: 'kb-2026.07.15',
    promptVersion: 'p-2.1',
    guardrailVersion: 'g-1.8',
    temperature: 0.2,
    /* 근거 문서의 개정 버전이 안 남았다 — 같은 이름의 문서를 찾아도 내용이 다를 수 있다 */
    sources: [{ name: '열처리 작업표준', rev: '' }],
    drift: [{ part: 'knowledge', was: 'kb-2026.07.15', now: 'kb-2026.07.27' }],
  },
]
