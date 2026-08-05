/**
 * 발주처 팩 — 발주처마다 다른 업무 데이터를 한 곳에 모은다.
 *
 * 이 제품의 핵심 주장은 **발주처를 갈아끼울 수 있다**는 것이다. 그런데 지금까지는
 * fixture가 전부 제조(한빛정밀) 하나뿐이라, 다른 발주처를 고르면 제조 문서가
 * 그대로 보였다 — 그래서 포털이 아예 못 고르게 막아 두었다.
 *
 * 팩은 그 막아 둔 이유를 없애는 구조다. `shared/api`는 **팩에서만** 데이터를 꺼내고,
 * 어느 팩을 볼지는 `shared/api/tenant`가 정한다.
 *
 * ⚠️ **없는 발주처에 다른 발주처 것을 대신 주지 않는다.** `packOf`는 `null`을
 * 돌려주고, 경계 함수는 '이 발주처의 업무 데이터가 없다'고 말한다. 조용히
 * 채워 넣으면 그게 바로 이전 데모의 사고다.
 */
import type { ChatMessage, FaqItem } from '@entities/chat/model'
import type { BusinessDocument } from '@entities/document/model'
import type { Dataset } from '@entities/dataset/model'
import type { KnowledgeBase } from '@entities/knowledge/model'
import type { MapIntel } from '@entities/mapintel/model'
import type { LiveMetric } from '@entities/metric/model'
import type { Notice } from '@entities/notice/model'
import type { WorkSignal } from '@entities/signal/model'
import type { Workspace } from '@entities/workspace/model'
import type { ChatEntry } from './chat'
import type { RegulationEntry } from './regulation'

/**
 * 한 발주처가 갖춰야 하는 업무 데이터.
 *
 * 타입이 완결성을 강제한다 — 항목을 빠뜨린 팩은 컴파일이 막는다.
 * '거의 다 됐다'는 상태로 발주처를 열 수 없게 하려는 것이다.
 */
export type DomainPackData = {
  documents: BusinessDocument[]
  workspaces: Workspace[]
  notices: Notice[]
  /** 챗봇이 아는 질문과 답 */
  chat: ChatEntry[]
  /** 근거를 못 찾았을 때의 답 — 이게 없으면 '모른다고 답한다'를 보여 줄 수 없다 */
  chatUnknown: Omit<ChatMessage, 'id' | 'role'>
  faq: FaqItem[]
  signals: WorkSignal[]
  liveMetric: LiveMetric
  mapIntel: MapIntel
  knowledgeBases: KnowledgeBase[]
  /** 지식 검색 예시 질의 — 화면이 칩으로 보여 준다 */
  knowledgeExamples: string[]
  /** 분석에 넣는 데이터 파일 */
  datasets: Dataset[]
  regulations: RegulationEntry[]
}

/* 팩은 자기 모듈에서 자기 것만 만든다 — 서로를 참조하지 않는다 */
import { MANUFACTURING_PACK } from './packs/manufacturing'

const PACKS: Record<string, DomainPackData> = {
  manufacturing: MANUFACTURING_PACK,
}

/** 이 발주처의 업무 데이터. 없으면 null — 부르는 쪽이 그 사실을 말해야 한다 */
export function packOf(domainId: string | null): DomainPackData | null {
  if (domainId === null) return null
  return PACKS[domainId] ?? null
}

/** 업무 데이터가 갖춰진 발주처 id 목록 — 포털의 선택 가능 여부와 같은 근거다 */
export const PACKED_DOMAIN_IDS: string[] = Object.keys(PACKS)
