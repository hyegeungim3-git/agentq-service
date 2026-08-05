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
import type { AgentId } from '@entities/agent/model'
import type { AnalysisKind, AnalysisResult } from '@entities/analysis/model'
import type { ChatMessage, FaqItem } from '@entities/chat/model'
import type { BusinessDocument } from '@entities/document/model'
import type { DataSourceOption, QueryResult } from '@entities/dataquery/model'
import type { Dataset } from '@entities/dataset/model'
import type { KnowledgeBase } from '@entities/knowledge/model'
import type { MapIntel } from '@entities/mapintel/model'
import type { LiveMetric } from '@entities/metric/model'
import type { MeetingRequest, MeetingResult } from '@entities/meeting/model'
import type { Notice } from '@entities/notice/model'
import type { OcrRequest, OcrResult } from '@entities/ocr/model'
import type { ReportRequest, ReportResult } from '@entities/report/model'
import type { TranslationRequest, TranslationResult } from '@entities/translation/model'
import type { RegulationSetOption, Violation } from '@entities/review/model'
import type { Hazard } from '@entities/safety/model'
import type { WorkSignal } from '@entities/signal/model'
import type { SummaryResult, SummaryStyle } from '@entities/summary/model'
import type { Workspace } from '@entities/workspace/model'
import type { ChatEntry } from './chat'
import type { CorpusItem } from './knowledge'
import type { RegulationEntry } from './regulation'

/**
 * 한 발주처가 갖춰야 하는 업무 데이터.
 *
 * 타입이 완결성을 강제한다 — 항목을 빠뜨린 팩은 컴파일이 막는다.
 * '거의 다 됐다'는 상태로 발주처를 열 수 없게 하려는 것이다.
 */
export type DomainPackData = {
  /**
   * 이 발주처가 **도입한** 에이전트.
   *
   * 13종 전부를 첫날부터 쓰는 발주처는 없다. 업무 데이터가 갖춰진 것부터 연다.
   * 카탈로그의 `status`(아직 안 만든 화면)와는 다른 축이다 — 화면은 있는데
   * 이 발주처에는 아직 안 들어온 것이다. 둘을 뭉뚱그리면 어느 쪽인지 알 수 없다.
   */
  agents: AgentId[]
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
  /** 도면 후보를 무엇과 견주는가 */
  knowledgeReferenceSpec: string
  /** 검색 엔진이 훑을 문서 — 발주처마다 다르다 */
  knowledgeCorpus: CorpusItem[]
  /** 분석에 넣는 데이터 파일 */
  datasets: Dataset[]
  regulations: RegulationEntry[]
  /** 문서별·방식별 요약 결과 */
  summaries: Record<string, Record<SummaryStyle, SummaryResult>>
  /** 사전 검토가 대조할 규정 묶음 — 이름도 발주처가 정한다 */
  reviewSets: RegulationSetOption[]
  /** 묶음별 위반. 고른 묶음이 결과를 실제로 바꿔야 체크박스가 장식이 아니다 */
  violationsBySet: Record<string, Violation[]>
  /** 묶음별 조항 수 — 얼마나 훑었는지 */
  clauseCountBySet: Record<string, number>
  /** 조회할 데이터 소스 — 이름도 예시 질의도 발주처가 정한다 */
  querySources: DataSourceOption[]
  /** 소스별 조회 결과 */
  queryResults: Record<string, QueryResult>
  /** 데이터셋별·유형별 분석 결과 */
  analyses: Record<string, Record<AnalysisKind, AnalysisResult>>
  /** 위험성평가 — 인원에 따라 성립하지 않는 대책이 있다 */
  safety: {
    /** 무슨 작업을 평가하는가 — 경계에 박아 두면 발주처를 바꿔도 안 바뀐다 */
    taskName: string
    hazardsCrew1: Hazard[]
    hazardsCrew2: Hazard[]
    references: string[]
  }
  /**
   * 서버가 할 일의 대역.
   *
   * 요약·검토처럼 표만 있으면 되는 것은 위에 데이터로 뒀지만, 인식·번역·보고서·
   * 회의록은 **입력에 따라 결과를 만들어 내야** 한다. 그 계산이 발주처마다 다르므로
   * 함수째로 팩이 갖는다 — 실제 서버가 붙으면 통째로 사라지는 자리다.
   */
  simulate: {
    ocr?: (req: OcrRequest) => OcrResult
    report?: (req: ReportRequest) => ReportResult
    meeting?: (req: MeetingRequest) => MeetingResult
    translate?: (req: TranslationRequest, text: string) => TranslationResult
  }
  /** 화면이 미리 채워 두는 예시 입력 — 이것도 발주처 것이다 */
  samples: {
    attendees?: string
    agenda?: string
    translationSource?: Record<'ko' | 'en', string>
    addressBatch?: string
  }
  /**
   * 복합 업무 시나리오 소개. 없으면 허브에 카드를 그리지 않는다.
   *
   * 릴레이는 에이전트 여러 개가 다 있어야 돈다 — 도입 전인 발주처에 카드를
   * 띄우면 눌러도 아무 일 없는 버튼이 된다.
   */
  scenario: { title: string; summary: string } | null
}

/* 팩은 자기 모듈에서 자기 것만 만든다 — 서로를 참조하지 않는다 */
import { CIVIC_PACK } from './packs/civic'
import { MANUFACTURING_PACK } from './packs/manufacturing'
import { MEDICAL_PACK } from './packs/medical'
import { PUBLIC_PACK } from './packs/public'

const PACKS: Record<string, DomainPackData> = {
  manufacturing: MANUFACTURING_PACK,
  public: PUBLIC_PACK,
  civic: CIVIC_PACK,
  medical: MEDICAL_PACK,
}

/** 이 발주처의 업무 데이터. 없으면 null — 부르는 쪽이 그 사실을 말해야 한다 */
export function packOf(domainId: string | null): DomainPackData | null {
  if (domainId === null) return null
  return PACKS[domainId] ?? null
}

/** 업무 데이터가 갖춰진 발주처 id 목록 — 포털의 선택 가능 여부와 같은 근거다 */
export const PACKED_DOMAIN_IDS: string[] = Object.keys(PACKS)

/**
 * 관리자 화면이 쓰는 팩 현황 — **여기서 뽑는다.**
 *
 * 예전에는 관리자 쪽에 따로 표를 두고 있었다. 네 번째 발주처를 열자
 * 포털은 넷이 열렸는데 관리자는 '업무 데이터 없음'이라고 말하는 상태가 됐다.
 * 같은 사실을 두 곳에 두면 반드시 갈라진다 — 그래서 파생으로 바꿨다.
 */
export type PackStatus = {
  domainId: string
  filled: string[]
  usable: boolean
  agentCount: number
}

export function packStatuses(): PackStatus[] {
  return Object.entries(PACKS).map(([domainId, pack]) => ({
    domainId,
    /* 실제로 채워진 것만 센다. 팩에 값이 있으면 채워진 것이다 */
    filled: [
      pack.documents.length > 0 ? 'documents' : '',
      pack.summaries && Object.keys(pack.summaries).length > 0 ? 'agentContent' : '',
      pack.scenario ? 'scenarios' : '',
      pack.mapIntel.sites.length > 0 ? 'mapIntel' : '',
      pack.signals.length > 0 ? 'signals' : '',
      pack.workspaces.length > 0 ? 'branding' : '',
    ].filter(Boolean),
    usable: true,
    agentCount: pack.agents.length,
  }))
}
