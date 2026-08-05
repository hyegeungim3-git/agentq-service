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
 * **13종을 모두 도입했다.** 번역 말뭉치와 표준화 대장까지 갖췄다.
 */
import type { AgentId } from '@entities/agent/model'
import { MEDICAL_RELAY_SCENARIO } from '../medical/relay'
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
import { MEDICAL_AGENT_DEFS, MEDICAL_SCENARIO_DEFS } from '../medical/agentdef'
import { MEDICAL_MCP_SERVERS, MEDICAL_TOOLS } from '../medical/tools'
import { MEDICAL_AREAS, MEDICAL_INDEX_ENTRIES } from '../medical/knowledgebase'
import { MEDICAL_AGENT_OPS } from '../medical/agentops'
import { MEDICAL_TRANSLATION } from '../medical/translation'
import { MEDICAL_CODE_MAPPING } from '../medical/mapping'
import { makeTranslationSimulator, sampleSourceOf } from '../translation'
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
  'translate',
  'address',
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
    translate: makeTranslationSimulator(MEDICAL_TRANSLATION),
    meeting: simulateMedicalMinutes,
  },
  samples: { translationSource: sampleSourceOf(MEDICAL_TRANSLATION), attendees: MEDICAL_ATTENDEE_SAMPLE, agenda: MEDICAL_AGENDA_SAMPLE },
  scenario: {
    summary: '회신 서식 1건이 인식 → 항목 코드 표준화 → 조정 이력 조회 → 점검 보고 초안까지 이어집니다.',
  },
  relay: {
    scenario: MEDICAL_RELAY_SCENARIO,
    ocr: { documentId: 'doc-suh-precheck', mode: 'inspection' },
    /* 병원은 주소가 아니라 청구 항목 코드를 푼다 */
    mapping: { mode: 'tags', documentName: '' },
    query: { source: 'claim', question: '회신 안 온 보류 건 진료과별로 보여줘' },
    report: { documentId: 'doc-suh-precheck', type: 'inspection' },
  },
  agentDefs: MEDICAL_AGENT_DEFS,
  scenarioDefs: MEDICAL_SCENARIO_DEFS,
  tools: MEDICAL_TOOLS,
  mcpServers: MEDICAL_MCP_SERVERS,
  knowledgeAreas: MEDICAL_AREAS,
  indexEntries: MEDICAL_INDEX_ENTRIES,
  agentOps: MEDICAL_AGENT_OPS,
  mapping: {
    /* 병원은 주소가 아니라 청구 항목 코드를 푼다 */
    modes: ['tags'],
    address: null,
    tagResult: MEDICAL_CODE_MAPPING,
    tagsTargetNote: '진료과가 등록한 청구 항목 명칭 전체를 대상으로 합니다. 별도 입력이 필요하지 않습니다.',
    ocrDocument: null,
    addressExamples: [],
    codeExamples: [],
  },
}
