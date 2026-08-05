/**
 * 공공(한국부동산원) 팩.
 *
 * **도입한 에이전트는 4종이다.** 13종을 첫날부터 쓰는 발주처는 없다 —
 * 업무 데이터가 갖춰진 것부터 연다. 나머지는 화면이 '이 발주처는 도입 전'으로
 * 구분해 말한다. 없는 데이터를 제조 것으로 채우는 것보다 이게 사실에 가깝다.
 *
 * 세계관은 2026년 3월, 표준지 공시지가 조사·검증 시즌이다.
 */
import type { AgentId } from '@entities/agent/model'
import { PUBLIC_WORKSPACES, PUBLIC_NOTICES, PUBLIC_SIGNALS, PUBLIC_APPEAL_QUEUE, PUBLIC_DATASETS } from '../public/basics'
import { PUBLIC_CHAT, PUBLIC_CHAT_UNKNOWN, PUBLIC_FAQ } from '../public/chat'
import { PUBLIC_QUERY_RESULTS, PUBLIC_QUERY_SOURCES } from '../public/dataquery'
import { PUBLIC_DOCUMENTS } from '../public/documents'
import { PUBLIC_CORPUS, PUBLIC_KNOWLEDGE_BASES, PUBLIC_REFERENCE_SPEC } from '../public/knowledge'
import { LAND_PRICE_CHANGE } from '../public/mapintel'
import { PUBLIC_REGULATIONS } from '../public/regulation'
import {
  PUBLIC_CLAUSE_COUNT,
  PUBLIC_REVIEW_SETS,
  PUBLIC_VIOLATIONS_BY_SET,
} from '../public/review'
import { PUBLIC_SUMMARIES } from '../public/summary'
import type { DomainPackData } from '../packs'

/** 1단계 도입 — 업무 데이터가 갖춰진 것부터 */
const ADOPTED: AgentId[] = ['chatbot', 'knowledge', 'internalreg', 'summary', 'review', 'dbquery']

export const PUBLIC_PACK: DomainPackData = {
  agents: ADOPTED,
  documents: PUBLIC_DOCUMENTS,
  workspaces: PUBLIC_WORKSPACES,
  notices: PUBLIC_NOTICES,
  chat: PUBLIC_CHAT,
  chatUnknown: PUBLIC_CHAT_UNKNOWN,
  faq: PUBLIC_FAQ,
  signals: PUBLIC_SIGNALS,
  liveMetric: PUBLIC_APPEAL_QUEUE,
  mapIntel: LAND_PRICE_CHANGE,
  knowledgeBases: PUBLIC_KNOWLEDGE_BASES,
  knowledgeExamples: ['유사 표준지', '이의신청 처리 기한', '가격 균형 협의', '실거래 괴리율'],
  knowledgeReferenceSpec: PUBLIC_REFERENCE_SPEC,
  knowledgeCorpus: PUBLIC_CORPUS,
  datasets: PUBLIC_DATASETS,
  regulations: PUBLIC_REGULATIONS,
  summaries: PUBLIC_SUMMARIES,
  reviewSets: PUBLIC_REVIEW_SETS,
  violationsBySet: PUBLIC_VIOLATIONS_BY_SET,
  clauseCountBySet: PUBLIC_CLAUSE_COUNT,
  querySources: PUBLIC_QUERY_SOURCES,
  queryResults: PUBLIC_QUERY_RESULTS,
  /* 릴레이가 부르는 인식·표준화·조회·보고서가 아직 도입 전이라 카드를 두지 않는다.
     띄워 두면 눌러도 아무 일 없는 버튼이 된다 */
  scenario: null,
}
