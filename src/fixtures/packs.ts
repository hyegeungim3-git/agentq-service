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
import type { AgentOps } from '@entities/agentops/model'
import type { AgentDefinition, ScenarioDefinition } from '@entities/agentdef/model'
import type { McpServer } from '@entities/evidence/model'
import type { ToolSpec } from '@entities/packops/model'
import type { AnalysisKind, AnalysisResult } from '@entities/analysis/model'
import type { ChatMessage, FaqItem } from '@entities/chat/model'
import type { BusinessDocument } from '@entities/document/model'
import type { DataSourceOption, QueryResult } from '@entities/dataquery/model'
import type { Dataset } from '@entities/dataset/model'
import type { KnowledgeBase } from '@entities/knowledge/model'
import type { IndexEntry, KnowledgeArea } from '@entities/knowledgebase/model'
import type { MapIntel } from '@entities/mapintel/model'
import type { MappingMode, TagMappingResult } from '@entities/mapping/model'
import type { Scenario } from '@entities/orchestration/model'
import type { OcrMode } from '@entities/ocr/model'
import type { ReportType } from '@entities/report/model'
import type { AddressCorpus } from './address'
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
   * 허브 카드에 쓰는 **한 줄 소개.** 없으면 카드를 그리지 않는다.
   *
   * ⚠️ 제목은 여기 없다 — `relay.scenario.title`에서 온다. 두 곳에 적어 두면
   * 카드와 화면이 다른 제목을 말하게 된다.
   */
  scenario: { summary: string } | null
  /**
   * 릴레이가 **무엇을 어떤 인자로 부르는가.**
   *
   * 릴레이 구조(인식 → 표준화 → 조회 → 보고)는 코어가 갖고, 부르는 값과
   * 단계 이름은 발주처가 준다. 코어에 하나만 두었더니 릴레이가 제조 이야기
   * 하나로 고정돼 나머지 세 발주처는 카드를 못 그렸다.
   *
   * `scenario`가 있으면 이것도 있어야 한다 — 소개만 있고 못 도는 카드는
   * 눌러도 아무 일 없는 버튼이 된다.
   */
  relay: {
    /** 화면이 그리는 서사 — 제목·트리거·산출물·4단계 라벨 */
    scenario: Scenario
    ocr: { documentId: string; mode: OcrMode }
    /** 주소를 안 푸는 발주처는 태그·코드 매핑으로 돈다 */
    mapping: { mode: MappingMode; documentName: string }
    query: { source: string; question: string }
    report: { documentId: string; type: ReportType }
  } | null
  /**
   * 이 발주처의 에이전트가 **무엇을 하도록 정해 놓았나** — 단계·담당·사람 확인 지점.
   *
   * 코어에 하나만 두었더니 병원 허브 카드에 `MES 조회`·`센서 이력 결합`·
   * `설비 상태 조회`가 떴다. 단계 이름은 그 발주처의 업무 용어이고 담당도
   * 그 발주처 부서다 — 발주처 데이터다.
   *
   * 도입한 에이전트만 넣는다. 도입 전이면 정의도 없다(카드가 단계를 안 그린다).
   */
  agentDefs: AgentDefinition[]
  /**
   * 여러 에이전트를 잇는 복합 업무 정의(관리자 시나리오 빌더).
   *
   * 포털의 릴레이 카드(`scenario`)와 다른 축이다 — 여기는 **정의해 둔 것**이고
   * 저기는 **지금 돌릴 수 있는 것**이다. 정의는 있는데 도입 안 한 에이전트를
   * 부르면 못 돈다는 사실을 관리자 화면이 말한다.
   */
  scenarioDefs: ScenarioDefinition[]
  /**
   * 이 발주처에 **실제로 연결된 도구**.
   *
   * 도구도 발주처마다 다르다 — 공장은 MES를, 시청은 처리 대장을 부른다.
   * 하나만 두었더니 관리자 도구 화면이 어느 발주처를 보든 제조 시스템을 보여 줬다.
   *
   * `usedBy`(사용처)는 여기 없다. 정의에서 유도한다 — 손으로 적으면 어긋난다.
   */
  tools: ToolSpec[]
  /** 그 도구를 주는 서버. 도구 id로 이어지므로 같은 팩 안에서 짝이 맞아야 한다 */
  mcpServers: McpServer[]
  /**
   * 지식 영역 — **색인과 권한의 단위.**
   *
   * 검색 묶음(`knowledgeBases`)과 축이 다르다. 저기는 지식 검색이 무엇을 뒤지는가,
   * 여기는 그게 실제로 찾아지는가와 누가 볼 수 있는가다. 대화 화면의 '답변 근거'와
   * 관리자 지식 관리가 이것을 읽는다.
   *
   * 하나만 두었더니 병원 대화 화면에 `작업표준·공정 문서`·`설비 대장·정비 이력`이 떴다.
   */
  knowledgeAreas: KnowledgeArea[]
  /** 등록됐는데 검색에 안 잡히는 문서. `areaId`가 위 영역과 짝이 맞아야 한다 */
  indexEntries: IndexEntry[]
  /**
   * 에이전트 운영 실적 — 얼마나 돌았고 얼마나 실패했나.
   *
   * `areaIds`가 **이 팩의 지식 영역**을 가리켜야 '기대는 영역에 못 찾는 문서가
   * 있다'는 판정이 성립한다. 다른 발주처의 영역 id를 들고 있으면 판정이 조용히
   * 빈 값이 되고, 화면은 '빈틈 없음'이라고 말하게 된다.
   */
  agentOps: AgentOps[]
  /**
   * 기준정보 표준화 — **무엇을 표준화하는가가 발주처마다 다르다.**
   *
   * 공장은 설비 태그와 사업장 주소를, 공시는 필지 소재지를, 시청은 광고물
   * 위치를, 병원은 청구 항목 코드를 푼다. 그래서 **쓰는 처리 유형**부터 다르다 —
   * 안 쓰는 유형을 라디오에 두면 고를 수 있는데 아무 일도 안 하는 칸이 된다.
   */
  mapping: {
    /** 이 발주처가 쓰는 처리 유형. 화면은 여기 있는 것만 그린다 */
    modes: MappingMode[]
    /** 주소 대장. 주소 유형을 안 쓰면 null — 병원은 주소가 아니라 코드를 푼다 */
    address: AddressCorpus | null
    /** 태그·코드 매핑 결과. 그 유형을 안 쓰면 null */
    tagResult: TagMappingResult | null
    /** 태그·코드 매핑이 무엇을 대상으로 하는가 — 공장은 설비 태그, 병원은 청구 항목이다 */
    tagsTargetNote: string | null
    /** 주소를 뽑을 문서. 그 유형을 안 쓰면 null */
    ocrDocument: string | null
    /** 입력창 아래 예시 — 이것도 발주처 것이다 */
    addressExamples: string[]
    codeExamples: string[]
  }
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
