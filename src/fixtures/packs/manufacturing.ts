/**
 * 제조(한빛정밀) 팩.
 *
 * 내용을 여기로 옮기지 않았다. 기존 fixture 파일이 이 발주처의 데이터이고,
 * 여기서는 **모아서 팩 하나로 보이게** 할 뿐이다. 옮기면 그 파일들을 직접 읽는
 * 테스트 20여 개가 함께 깨지고, 옮기는 김에 내용이 조금씩 바뀐다.
 */
import { CHAT_ENTRIES, CHAT_UNKNOWN, FAQ_ITEMS } from '../chat'
import { DATASETS } from '../datasets'
import { DOCUMENTS } from '../documents'
import { CORPUS, KNOWLEDGE_BASES, REFERENCE_SPEC } from '../knowledge'
import { SITE_UTILIZATION } from '../mapintel'
import { PRESS_VIBRATION } from '../metrics'
import { NOTICES } from '../notices'
import { REGULATION_ENTRIES } from '../regulation'
import { SIGNALS } from '../signals'
import { WORKSPACES } from '../workspaces'
import type { DomainPackData } from '../packs'

export const MANUFACTURING_PACK: DomainPackData = {
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
}
