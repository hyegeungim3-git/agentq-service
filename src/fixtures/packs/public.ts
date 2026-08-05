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
import { PUBLIC_ANALYSES } from '../public/analysis'
import {
  PUBLIC_AGENDA_SAMPLE,
  PUBLIC_ATTENDEE_SAMPLE,
  simulatePublicMinutes,
} from '../public/meeting'
import { simulatePublicOcr } from '../public/ocr'
import { PUBLIC_REPORT_BASE } from '../public/report'
import { makeReportSimulator } from '../report'
import { PUBLIC_QUERY_RESULTS, PUBLIC_QUERY_SOURCES } from '../public/dataquery'
import { PUBLIC_DOCUMENTS } from '../public/documents'
import { PUBLIC_AGENT_DEFS, PUBLIC_SCENARIO_DEFS } from '../public/agentdef'
import { PUBLIC_MCP_SERVERS, PUBLIC_TOOLS } from '../public/tools'
import { PUBLIC_AREAS, PUBLIC_INDEX_ENTRIES } from '../public/knowledgebase'
import { PUBLIC_AGENT_OPS } from '../public/agentops'
import { PUBLIC_CORPUS, PUBLIC_KNOWLEDGE_BASES, PUBLIC_REFERENCE_SPEC } from '../public/knowledge'
import { LAND_PRICE_CHANGE } from '../public/mapintel'
import { PUBLIC_REGULATIONS } from '../public/regulation'
import {
  PUBLIC_HAZARDS_CREW_1,
  PUBLIC_HAZARDS_CREW_2,
  PUBLIC_SAFETY_REFERENCES,
} from '../public/safety'
import {
  PUBLIC_CLAUSE_COUNT,
  PUBLIC_REVIEW_SETS,
  PUBLIC_VIOLATIONS_BY_SET,
} from '../public/review'
import { PUBLIC_SUMMARIES } from '../public/summary'
import type { DomainPackData } from '../packs'

/** 1단계 도입 — 업무 데이터가 갖춰진 것부터 */
const ADOPTED: AgentId[] = ['chatbot', 'knowledge', 'internalreg', 'summary', 'review', 'dbquery', 'dataanalysis', 'safety', 'ocr', 'report', 'meeting']

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
  analyses: PUBLIC_ANALYSES,
  safety: {
    taskName: '표준지 현장조사',
    hazardsCrew1: PUBLIC_HAZARDS_CREW_1,
    hazardsCrew2: PUBLIC_HAZARDS_CREW_2,
    references: PUBLIC_SAFETY_REFERENCES,
  },
  /* 도입한 것만 준다. 없는 것은 경계가 '아직 도입하지 않았습니다'라고 답한다 —
     빈 함수를 끼워 넣으면 눌렀을 때 빈 결과가 나오고, 그게 더 나쁘다 */
  simulate: {
    ocr: simulatePublicOcr,
    report: makeReportSimulator(PUBLIC_REPORT_BASE),
    meeting: simulatePublicMinutes,
  },
  /* 번역·주소 예시는 그 에이전트를 도입할 때 함께 채운다 */
  samples: { attendees: PUBLIC_ATTENDEE_SAMPLE, agenda: PUBLIC_AGENDA_SAMPLE },
  /* 릴레이가 부르는 표준화·보고서가 아직 도입 전이라 카드를 두지 않는다.
     띄워 두면 눌러도 아무 일 없는 버튼이 된다 */
  scenario: null,
  agentDefs: PUBLIC_AGENT_DEFS,
  scenarioDefs: PUBLIC_SCENARIO_DEFS,
  tools: PUBLIC_TOOLS,
  mcpServers: PUBLIC_MCP_SERVERS,
  knowledgeAreas: PUBLIC_AREAS,
  indexEntries: PUBLIC_INDEX_ENTRIES,
  agentOps: PUBLIC_AGENT_OPS,
}
