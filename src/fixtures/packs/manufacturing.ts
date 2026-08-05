/**
 * 제조(한빛정밀) 팩.
 *
 * 내용을 여기로 옮기지 않았다. 기존 fixture 파일이 이 발주처의 데이터이고,
 * 여기서는 **모아서 팩 하나로 보이게** 할 뿐이다. 옮기면 그 파일들을 직접 읽는
 * 테스트 20여 개가 함께 깨지고, 옮기는 김에 내용이 조금씩 바뀐다.
 */
import { AGENTS } from '@entities/agent/model'
import { AGENT_DEFS, SCENARIO_DEFS } from '../agentdef'
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
    title: '수입검사 성적서 접수 처리',
    summary: '성적서 1건이 인식 → 주소 표준화 → 이력 조회 → 보고서 초안까지 이어집니다.',
  },
  /* 제조는 기본 팩이라 정의도 fixtures 루트에 있다 — 다른 팩은 자기 폴더에 둔다 */
  agentDefs: AGENT_DEFS,
  scenarioDefs: SCENARIO_DEFS,
}
