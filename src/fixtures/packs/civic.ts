/**
 * 행정(한성시청) 팩.
 *
 * **세 번째 팩이다.** 이 팩을 만들면서 코어를 고친 곳은 없다 —
 * 앞의 두 팩에서 옵션 라벨·시뮬레이터·예시 입력을 전부 팩으로 끌어냈기 때문이다.
 * 여기서는 값만 채웠다. 그게 '갈아끼울 수 있다'의 실제 의미다.
 *
 * 도입 11종. 문서 번역과 기준정보 표준화는 도입 전이다 —
 * 공공과 같은 이유(4개 언어 대역 데이터 / 신규 설계)다.
 */
import type { AgentId } from '@entities/agent/model'
import {
  CIVIC_ANALYSES,
  CIVIC_CLAUSE_COUNT,
  CIVIC_HAZARDS_CREW_1,
  CIVIC_HAZARDS_CREW_2,
  CIVIC_QUERY_RESULTS,
  CIVIC_QUERY_SOURCES,
  CIVIC_REVIEW_SETS,
  CIVIC_SAFETY_REFERENCES,
  CIVIC_SUMMARIES,
  CIVIC_VIOLATIONS_BY_SET,
} from '../civic/agents'
import {
  CIVIC_AGENDA_SAMPLE,
  CIVIC_ATTENDEE_SAMPLE,
  simulateCivicMinutes,
  simulateCivicOcr,
  simulateCivicReport,
} from '../civic/docagents'
import { CIVIC_CHAT, CIVIC_CHAT_UNKNOWN, CIVIC_FAQ } from '../civic/chat'
import { CIVIC_DOCUMENTS } from '../civic/documents'
import { CIVIC_AGENT_DEFS, CIVIC_SCENARIO_DEFS } from '../civic/agentdef'
import {
  CIVIC_CIVIL_QUEUE,
  CIVIC_DATASETS,
  CIVIC_NOTICES,
  CIVIC_SIGNALS,
  CIVIC_WORKSPACES,
} from '../civic/basics'
import {
  CIVIC_CORPUS,
  CIVIC_KNOWLEDGE_BASES,
  CIVIC_REFERENCE_SPEC,
} from '../civic/knowledge'
import { CIVIC_COMPLAINT_RATE } from '../civic/mapintel'
import { CIVIC_REGULATIONS } from '../civic/regulation'
import type { DomainPackData } from '../packs'

const ADOPTED: AgentId[] = [
  'chatbot',
  'knowledge',
  'internalreg',
  'summary',
  'review',
  'dbquery',
  'dataanalysis',
  'safety',
  'ocr',
  'report',
  'meeting',
]

export const CIVIC_PACK: DomainPackData = {
  agents: ADOPTED,
  documents: CIVIC_DOCUMENTS,
  workspaces: CIVIC_WORKSPACES,
  notices: CIVIC_NOTICES,
  chat: CIVIC_CHAT,
  chatUnknown: CIVIC_CHAT_UNKNOWN,
  faq: CIVIC_FAQ,
  signals: CIVIC_SIGNALS,
  liveMetric: CIVIC_CIVIL_QUEUE,
  mapIntel: CIVIC_COMPLAINT_RATE,
  knowledgeBases: CIVIC_KNOWLEDGE_BASES,
  knowledgeExamples: ['하천 공사 소음', '기한 연장 통지', '옥외광고물 계고', '임시 제방 점검'],
  knowledgeReferenceSpec: CIVIC_REFERENCE_SPEC,
  knowledgeCorpus: CIVIC_CORPUS,
  datasets: CIVIC_DATASETS,
  regulations: CIVIC_REGULATIONS,
  summaries: CIVIC_SUMMARIES,
  reviewSets: CIVIC_REVIEW_SETS,
  violationsBySet: CIVIC_VIOLATIONS_BY_SET,
  clauseCountBySet: CIVIC_CLAUSE_COUNT,
  querySources: CIVIC_QUERY_SOURCES,
  queryResults: CIVIC_QUERY_RESULTS,
  analyses: CIVIC_ANALYSES,
  safety: {
    taskName: '현장 확인 업무',
    hazardsCrew1: CIVIC_HAZARDS_CREW_1,
    hazardsCrew2: CIVIC_HAZARDS_CREW_2,
    references: CIVIC_SAFETY_REFERENCES,
  },
  simulate: {
    ocr: simulateCivicOcr,
    report: simulateCivicReport,
    meeting: simulateCivicMinutes,
  },
  samples: { attendees: CIVIC_ATTENDEE_SAMPLE, agenda: CIVIC_AGENDA_SAMPLE },
  /* 릴레이가 부르는 표준화·번역이 도입 전이라 카드를 두지 않는다 */
  scenario: null,
  agentDefs: CIVIC_AGENT_DEFS,
  scenarioDefs: CIVIC_SCENARIO_DEFS,
}
