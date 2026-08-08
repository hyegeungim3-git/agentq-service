/**
 * 제조(한빛정밀) 팩.
 *
 * 내용을 여기로 옮기지 않았다. 기존 fixture 파일이 이 발주처의 데이터이고,
 * 여기서는 **모아서 팩 하나로 보이게** 할 뿐이다. 옮기면 그 파일들을 직접 읽는
 * 테스트 20여 개가 함께 깨지고, 옮기는 김에 내용이 조금씩 바뀐다.
 */
import { AGENTS } from '@entities/agent/model'
import { HBP_ACTIVITY } from '../agentusage'
import { INSPECTION_SCENARIO } from '../orchestration'
import { AGENT_DEFS, SCENARIO_DEFS } from '../agentdef'
import { TOOLS } from '../packops'
import { MCP_SERVERS } from '../evidence'
import { AREAS, INDEX_ENTRIES } from '../knowledgebase'
import { AGENT_OPS } from '../agentops'
import { MANUFACTURING_ADDRESS } from '../address'
import { MAPPING_RESULT } from '../mapping'
import { ANALYSIS_RESULTS } from '../analysis'
import { HAZARDS_CREW_1, HAZARDS_CREW_2, SAFETY_REFERENCES } from '../safety'
import { CHAT_ENTRIES, CHAT_UNKNOWN, FAQ_ITEMS } from '../chat'
import { DATA_SOURCES, QUERY_RESULTS } from '../dataquery'
import { DATASETS } from '../datasets'
import { DOCUMENTS } from '../documents'
import { CORPUS, KNOWLEDGE_BASES, REFERENCE_SPEC } from '../knowledge'
import { SITE_UTILIZATION } from '../mapintel'
import { PRESS_VIBRATION } from '../metrics'
import { NOTICES } from '../notices'
import { REGULATION_ENTRIES } from '../regulation'
import { SIGNALS } from '../signals'
import { CLAUSE_COUNT, REVIEW_SETS, VIOLATIONS_BY_SET } from '../review'
import { AGENDA_SAMPLE, ATTENDEE_SAMPLE, simulateMinutes } from '../meeting'
import { simulateOcr } from '../ocr'
import { simulateReport } from '../report'
import { SAMPLE_SOURCE, simulateTranslation } from '../translation'
import { BATCH_SAMPLE } from '../address'
import { SUMMARY_RESULTS } from '../summary'
import { WORKSPACES } from '../workspaces'
import type { DomainPackData } from '../packs'

/* 제조는 13종을 전부 도입했다 — 업무 데이터가 다 갖춰져 있다 */
export const MANUFACTURING_PACK: DomainPackData = {
  agents: AGENTS.map((a) => a.id),
  activity: HBP_ACTIVITY,
  documents: DOCUMENTS,
  workspaces: WORKSPACES,
  notices: NOTICES,
  chat: CHAT_ENTRIES,
  chatUnknown: CHAT_UNKNOWN,
  faq: FAQ_ITEMS,
  signals: SIGNALS,
  liveMetric: PRESS_VIBRATION,
  mapIntel: SITE_UTILIZATION,
  knowledgeBases: KNOWLEDGE_BASES,
  knowledgeExamples: ['브래킷 굽힘 금형', '진동 관리 기준', '절삭유 농도', '버 과다'],
  knowledgeReferenceSpec: REFERENCE_SPEC,
  knowledgeCorpus: CORPUS,
  datasets: DATASETS,
  regulations: REGULATION_ENTRIES,
  summaries: SUMMARY_RESULTS,
  reviewSets: REVIEW_SETS,
  violationsBySet: VIOLATIONS_BY_SET,
  clauseCountBySet: CLAUSE_COUNT,
  querySources: DATA_SOURCES,
  queryResults: QUERY_RESULTS,
  analyses: ANALYSIS_RESULTS,
  safety: {
    taskName: '프레스 금형 교체 작업',
    docNo: 'HBP-안전-2026-034',
    hazardsCrew1: HAZARDS_CREW_1,
    hazardsCrew2: HAZARDS_CREW_2,
    references: SAFETY_REFERENCES,
  },
  simulate: {
    ocr: simulateOcr,
    report: simulateReport,
    meeting: simulateMinutes,
    translate: simulateTranslation,
  },
  samples: {
    attendees: ATTENDEE_SAMPLE,
    agenda: AGENDA_SAMPLE,
    translationSource: SAMPLE_SOURCE,
    addressBatch: BATCH_SAMPLE,
  },
  scenario: {
    summary: '성적서 1건이 인식 → 주소 표준화 → 이력 조회 → 보고서 초안까지 이어집니다.',
  },
  relay: {
    scenario: INSPECTION_SCENARIO,
    ocr: { documentId: 'doc-inspection-cert', mode: 'inspection' },
    mapping: { mode: 'address-ocr', documentName: '수입검사성적서_SPCC-2211.pdf' },
    query: { source: 'equipment', question: '창원본사 최근 도입 설비를 진동 높은 순으로' },
    report: { documentId: 'doc-inspection-cert', type: 'incident' },
  },
  /* 제조는 기본 팩이라 정의도 fixtures 루트에 있다 — 다른 팩은 자기 폴더에 둔다 */
  agentDefs: AGENT_DEFS,
  scenarioDefs: SCENARIO_DEFS,
  tools: TOOLS,
  mcpServers: MCP_SERVERS,
  knowledgeAreas: AREAS,
  indexEntries: INDEX_ENTRIES,
  agentOps: AGENT_OPS,
  mapping: {
    modes: ['tags', 'address-single', 'address-batch', 'address-ocr', 'code-lookup'],
    address: MANUFACTURING_ADDRESS,
    tagResult: MAPPING_RESULT,
    tagsTargetNote: '수집 서버에 쌓인 설비 태그 전체를 대상으로 합니다. 별도 입력이 필요하지 않습니다.',
    ocrDocument: '수입검사성적서_SPCC-2211.pdf',
    addressExamples: ['창원본사 공단로 274', '대성정밀공업 부산 사상구', '한빛테크 광주 하남산단'],
    codeExamples: ['4812310300', '4812110100', '9999999999'],
  },
}
