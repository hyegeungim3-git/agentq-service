/**
 * 의료(새빛대학교병원) 팩.
 *
 * **네 번째 팩이다.** 세 번째와 마찬가지로 코어를 고치지 않았다 — 값만 채웠다.
 * 이로써 포털의 네 발주처가 모두 열린다.
 *
 * ⚠️ 이 팩은 환자를 다룬다. 문구는 행정·심사 관점으로만 쓰고, 인식 예시의
 * 개인정보도 직원 연락처로 뒀다 — 환자 정보를 예시로 만들면 그 자체가
 * 이 제품이 없애려는 것이 된다.
 *
 * 도입 11종. 번역과 기준정보 표준화는 앞선 팩과 같은 이유로 도입 전이다.
 */
import type { AgentId } from '@entities/agent/model'
import {
  MEDICAL_ANALYSES,
  MEDICAL_CLAUSE_COUNT,
  MEDICAL_HAZARDS_CREW_1,
  MEDICAL_HAZARDS_CREW_2,
  MEDICAL_QUERY_RESULTS,
  MEDICAL_QUERY_SOURCES,
  MEDICAL_REVIEW_SETS,
  MEDICAL_SAFETY_REFERENCES,
  MEDICAL_SUMMARIES,
  MEDICAL_VIOLATIONS_BY_SET,
} from '../medical/agents'
import {
  MEDICAL_AGENDA_SAMPLE,
  MEDICAL_ATTENDEE_SAMPLE,
  simulateMedicalMinutes,
  simulateMedicalOcr,
  simulateMedicalReport,
} from '../medical/docagents'
import { MEDICAL_CHAT, MEDICAL_CHAT_UNKNOWN, MEDICAL_FAQ } from '../medical/chat'
import { MEDICAL_DOCUMENTS } from '../medical/documents'
import {
  MEDICAL_DATASETS,
  MEDICAL_ER_CENSUS,
  MEDICAL_NOTICES,
  MEDICAL_SIGNALS,
  MEDICAL_WORKSPACES,
} from '../medical/basics'
import {
  MEDICAL_CORPUS,
  MEDICAL_KNOWLEDGE_BASES,
  MEDICAL_REFERENCE_SPEC,
} from '../medical/knowledge'
import { MEDICAL_BED_USAGE } from '../medical/mapintel'
import { MEDICAL_REGULATIONS } from '../medical/regulation'
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

export const MEDICAL_PACK: DomainPackData = {
  agents: ADOPTED,
  documents: MEDICAL_DOCUMENTS,
  workspaces: MEDICAL_WORKSPACES,
  notices: MEDICAL_NOTICES,
  chat: MEDICAL_CHAT,
  chatUnknown: MEDICAL_CHAT_UNKNOWN,
  faq: MEDICAL_FAQ,
  signals: MEDICAL_SIGNALS,
  liveMetric: MEDICAL_ER_CENSUS,
  mapIntel: MEDICAL_BED_USAGE,
  knowledgeBases: MEDICAL_KNOWLEDGE_BASES,
  knowledgeExamples: ['기록 근거 보완', '재료대 산정', '응급증상 판단', '병상 조정 기준'],
  knowledgeReferenceSpec: MEDICAL_REFERENCE_SPEC,
  knowledgeCorpus: MEDICAL_CORPUS,
  datasets: MEDICAL_DATASETS,
  regulations: MEDICAL_REGULATIONS,
  summaries: MEDICAL_SUMMARIES,
  reviewSets: MEDICAL_REVIEW_SETS,
  violationsBySet: MEDICAL_VIOLATIONS_BY_SET,
  clauseCountBySet: MEDICAL_CLAUSE_COUNT,
  querySources: MEDICAL_QUERY_SOURCES,
  queryResults: MEDICAL_QUERY_RESULTS,
  analyses: MEDICAL_ANALYSES,
  safety: {
    taskName: '응급의료센터 운영',
    hazardsCrew1: MEDICAL_HAZARDS_CREW_1,
    hazardsCrew2: MEDICAL_HAZARDS_CREW_2,
    references: MEDICAL_SAFETY_REFERENCES,
  },
  simulate: {
    ocr: simulateMedicalOcr,
    report: simulateMedicalReport,
    meeting: simulateMedicalMinutes,
  },
  samples: { attendees: MEDICAL_ATTENDEE_SAMPLE, agenda: MEDICAL_AGENDA_SAMPLE },
  /* 릴레이가 부르는 표준화·번역이 도입 전이라 카드를 두지 않는다 */
  scenario: null,
}
