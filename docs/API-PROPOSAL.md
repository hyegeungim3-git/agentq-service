# API 제안서 (프론트 → 백엔드)

> **이 문서의 위치**
> API 계약을 **프론트가 제안하고 백엔드가 확정한다**(2026-08-02 결정, `DECISIONS.md` D-010).
> 여기 적힌 것은 결정이 아니라 **제안**이다. 백엔드가 다르게 정하면 그쪽을 따르고
> 이 문서를 고친다. 확정 전까지 `src/shared/api/`의 함수들이 fixture를 돌려준다.
>
> 제안의 근거는 상상이 아니라 **지금 화면이 실제로 쓰는 데이터**다.
> 요청·응답 형태는 이 문서에 다시 적지 않고 TypeScript 타입을 가리킨다 —
> 두 곳에 적으면 반드시 갈라진다.

## 1. 공통 규약

### 1-1. 전송과 상태 코드

| 상황 | 제안 |
|---|---|
| 성공 | `200 OK` + 본문은 아래 표의 응답 타입 그대로 |
| 생성(업로드) | `201 Created` + 생성된 자원 |
| 입력 오류 | `400` + 오류 본문 |
| 권한 없음 | `401` / `403` + 오류 본문 |
| 없는 자원 | `404` + 오류 본문 |
| 서버 오류 | `5xx` + 오류 본문 |

**오류 본문**

```json
{ "code": "DOCUMENT_NOT_FOUND", "message": "번역할 문서를 찾지 못했습니다." }
```

`message`는 **사용자에게 그대로 보여 줄 수 있는 한국어 문장**으로 요청한다.
화면이 오류를 다시 쓰지 않고 그대로 띄우기 때문이다(`shared/api`의 `ApiResult.error`).
사용자에게 보여 줄 수 없는 내부 사정은 `code`로만 구분하고 `message`는 일반 문구로 준다.

성공/실패 판별을 본문 필드가 아니라 **상태 코드**로 하자고 제안한다.
클라이언트의 `ApiResult<T>`(`{ok:true,data} | {ok:false,error}`)는 화면 쪽 표현이고,
HTTP에 그 봉투를 강요하지 않는다. 변환은 `shared/api` 안에서 한다.

### 1-2. 값의 형태

- 수치는 **원시 값**으로 준다. `4820`이지 `"4,820개"`가 아니다. 천 단위·단위 표기는 화면이 한다.
- 비율은 0~1 실수로 준다(`0.71`). 퍼센트 변환은 화면이 한다.
- 날짜는 `YYYY-MM-DD`, 시각은 ISO 8601.
- 색·아이콘·정렬 순서 같은 표시 속성은 응답에 넣지 않는다.
- 소요 시간(`elapsedSeconds`)은 서버가 실제 처리에 쓴 시간으로 준다.

### 1-3. 신뢰도와 '못 한 것'

이 제품의 화면은 **AI가 못 한 것을 드러내는 것**을 값어치로 삼는다.
그래서 응답에 다음이 반드시 있어야 한다. 없으면 화면이 거짓말을 하게 된다.

| 필요한 것 | 쓰는 곳 |
|---|---|
| 항목별 신뢰도(0~1) | OCR 줄, 번역 문장, 매핑 후보, 챗봇 답변 |
| 근거·출처(문서 id + 위치 + 원문) | 챗봇, 규정 조회, 보고서 절 |
| 처리하지 못한 항목과 **그 이유** | 매핑(`blocker`), 분석(`excludedReasons`), 조회(`unmapped`) |
| 사람이 채워야 하는 칸 | 보고서(`pendingFields`), 회의록(미확정 담당·기한) |
| 가정한 조건 | 조회(`assumptions`) |

## 2. 엔드포인트

요청·응답 타입은 파일을 가리킨다. `→` 왼쪽이 요청, 오른쪽이 응답이다.

| 제안 엔드포인트 | 클라이언트 함수 | 타입 |
|---|---|---|
| `GET /domains` | `fetchDomains` | → `Domain[]` (`entities/domain/model.ts`) |
| `GET /domains/{id}` | `fetchDomain` | → `Domain` |
| `GET /workspaces` | `fetchWorkspaces` | → `Workspace[]` (`entities/workspace/model.ts`) |
| `GET /notices` | `fetchNotices` | → `Notice[]` (`entities/notice/model.ts`) |
| `GET /documents` | `fetchDocuments` | `?kind=sop\|report\|certificate\|minutes` → `BusinessDocument[]` (`entities/document/model.ts`) |
| `POST /documents (multipart)` | `uploadDocument` | 파일 → `BusinessDocument` |
| `GET /compliance/evidence` | `fetchEvidence` | → `EvidenceItem[]` (`entities/evidence/model.ts`). 책무마다 **기록이 어디에 남는지** — '이행했다'와 '증명할 수 있다'는 다르다 |
| `GET /tools/servers` | `fetchMcpServers` | → `McpServer[]`. **주소·토큰은 응답에 넣지 않는다** — §2-9와 같은 이유 |
| `GET /volumes` | `fetchVolumes` | → `Volume[]` |
| `DELETE /volumes/{id}` | `releaseVolume` | 볼륨 비우기 |
| `GET /vector/collections` | `fetchCollections` | → `VectorCollection[]` (`entities/datainfra/model.ts`). **차원과 임베딩 모델을 함께** — 다르면 같은 검색에서 못 섞는다 |
| `GET /ingest/sources` | `fetchIngestSources` | → `IngestSource[]`. 마지막 실행 성공 여부와 **가져온 건수**를 함께 — 성공 표시만으로는 0건을 못 잡는다 |
| `POST /ingest/sources/{id}:run` | `runIngest` | 수동 수집 |
| `GET /benchmarks` | `fetchBenchmarks` | → `Benchmark[]`. **업무 근접도(`relevance`)를 함께** — 점수만 오면 위키 독해 잘하는 모델을 사내 QA용으로 고르게 된다 |
| `GET /benchmarks/runs` | `fetchBenchmarkRuns` | → `BenchmarkRun[]` |
| `GET /apps/instances` | `fetchAppInstances` | → `AppInstance[]` (`entities/appinst/model.ts`). 내려간 앱은 사유(`downReason`) 필수 |
| `PATCH /apps/instances/{id}` | `setInstanceLive` | 앱 올리기·내리기 |
| `GET /knowledge/pipeline-runs` | `fetchPipelineRuns` | → `PipelineRun[]`. **단계별 들어온 수·나간 수·떨어진 사유**를 함께 — 최종 건수만 오면 고칠 곳을 못 찾는다 |
| `GET /agents/definitions` | `fetchAgentDefs` | → `AgentDefinition[]` (`entities/agentdef/model.ts`). **단계와 사람 확인 지점을 함께** — 능력 배지만 오면 '확인 없이 나가는 에이전트'를 그릴 수 없다 |
| `GET /agents/adopted` | `fetchAdoptedAgents` | → 이 발주처가 **도입한** 에이전트 id 목록. 카탈로그의 '아직 안 만든 화면'과 다른 축이다 — 화면은 있는데 이 발주처엔 안 들어온 것 |
| `PUT /agents/definitions/{id}` | `saveAgentDef` | 정의 변경 — 답이 달라지는 일이라 검토·되돌리기가 함께 필요하다 |
| `GET /workflows` | `fetchWorkflows` | → `Workflow[]` (`entities/workflow/model.ts`). **탄 분기와 멈춘 노드를 함께** — 성공률만 오면 왜 실패했는지·안 타는 분기를 그릴 수 없다 |
| `PATCH /workflows/{id}` | `setWorkflowEnabled` | 켜기·끄기 |
| `GET /scenarios` | `fetchScenarioDefs` | → `ScenarioDefinition[]`. 단계마다 어느 에이전트를 부르는지 |
| `PUT /scenarios/{id}` | `saveScenario` | 시나리오 변경 |
| `GET /analysis/datasets` | `fetchDatasets` | → `Dataset[]` (`entities/dataset/model.ts`). 분석에 넣는 **데이터 파일**이다 — 학습·평가 데이터셋(`GET /datasets`)과 다른 자원 |
| `POST /analysis/datasets (multipart)` | `uploadDataset` | 파일 → `Dataset` (`entities/dataset/model.ts`) |
| `POST /summaries` | `createSummary` | `SummaryRequest` → `SummaryResult` (`entities/summary/model.ts`) |
| `POST /translations` | `createTranslation` | `TranslationRequest` + 원문 → `TranslationResult` (`entities/translation/model.ts`) |
| `GET /reviews/regulation-sets` | `fetchReviewSets` | → `RegulationSetOption[]` (`entities/review/model.ts`). **묶음 이름도 발주처가 정한다** — '품질경영매뉴얼'은 제조 전용이었다 |
| `POST /reviews` | `createReview` | `ReviewRequest` → `ReviewResult` (`entities/review/model.ts`) |
| `POST /reports` | `createReport` | `ReportRequest` → `ReportResult` (`entities/report/model.ts`) |
| `POST /minutes` | `createMinutes` | `MeetingRequest` → `MeetingResult` (`entities/meeting/model.ts`) |
| `POST /regulations:search` | `askRegulation` | `RegulationRequest` → `RegulationAnswer` (`entities/regulation/model.ts`) |
| `GET /knowledge-bases` | `fetchKnowledgeContext` | → `KnowledgeContext` (`entities/knowledge/model.ts`). 범위 목록만이 아니라 **예시 질의와 견주는 사양**을 함께 — 발주처마다 다르다 |
| `POST /knowledge:search` | `searchKnowledge` | `KnowledgeRequest` → `KnowledgeResult` |
| `POST /ocr:recognize` | `recognizeDocument` | `OcrRequest` → `OcrResult` (`entities/ocr/model.ts`) |
| `GET /queries/sources` | `fetchQuerySources` | → `DataSourceOption[]` (`entities/dataquery/model.ts`). **소스 이름도 예시 질의도 발주처가 정한다** |
| `POST /queries` | `runQuery` | `QueryRequest` → `QueryResult` (`entities/dataquery/model.ts`) |
| `GET /mapping/config` | `fetchMappingConfig` | → 이 발주처가 쓰는 처리 유형·예시·대상 문서. **안 쓰는 유형을 라디오에 두면 고를 수 있는데 아무 일도 안 하는 칸이 된다** — 병원은 주소가 아니라 청구 항목 코드를 푼다 |
| `POST /mapping:run` | `runMapping` | `MappingRequest` → `MappingResult` (`entities/mapping/model.ts`) |
| `POST /analyses` | `analyzeData` | `AnalysisRequest` → `AnalysisResult` (`entities/analysis/model.ts`) |
| `POST /safety-plans` | `createSafetyPlan` | `SafetyRequest` → `SafetyPlan` (`entities/safety/model.ts`) |
| `POST /chat/messages` | `sendMessage` | 질문 문자열 → `ChatMessage` (`entities/chat/model.ts`). 사업장별 지표를 묻는 질문이면 `map`(`entities/mapintel/model.ts`)이 함께 온다 — 별도 호출을 만들지 않은 이유는 §2-5 |
| `GET /chat/faq` | `fetchFaq` | → `FaqItem[]` |
| `GET /metrics/live` | `fetchLiveMetrics` | → `LiveMetric[]` (`entities/metric/model.ts`) — 실제로는 스트리밍/폴링이 맞다. §2-3 참조 |
| `GET /samples` | `fetchSamples` | → 화면이 미리 채워 두는 예시 입력(회의 참석자·번역 원문·주소 목록). **발주처마다 다르다** — 화면이 fixture를 직접 읽던 자리다 |
| `GET /signals` | `fetchSignals` | → `WorkSignal[]` (`entities/signal/model.ts`) — 알림 센터·오늘의 브리핑이 함께 쓴다 |
| `GET /infra/cluster` | `fetchCluster` | → `ClusterResource` (`entities/infra/model.ts`) — 비율은 0~1 |
| `GET /infra/nodes` | `fetchNodes` | → `NodeInfo[]` |
| `GET /infra/pods?window=` | `fetchPods` | `window`=`1h`\|`6h`\|`24h`\|`7d` → `PodInfo[]`. 구간은 **서버 질의 조건**이다 — §2-7 |
| `GET /infra/services` | `fetchServices` | → `ServiceStatus[]`. 정상이 아니면 `reason`·`action`이 있어야 한다 — §2-7 |
| `GET /infra/gpus` | `fetchGpuNodes` | → `GpuNode[]`. 과부하 판정은 화면이 한다(원시 값만 준다) |
| `GET /users?keyword=&role=&state=` | `fetchUsers` | → `PlatformUser[]` (`entities/user/model.ts`). **거르기는 서버가 한다** — §3-3 |
| `PATCH /users/{id}` | `updateUserState` | 상태 변경. 인증·권한이 정해지기 전까지 화면은 실패를 그대로 알린다 |
| `GET /approvals` | `fetchApprovals` | → `ApprovalRequest[]`. 신청 사유가 없으면 `null`(빈 문자열 금지) |
| `GET /meta/as-of` | `fetchAsOf` | → `string`(YYYY-MM-DD). **이 데이터가 언제 기준인가.** '며칠 대기'·'차단 만료'가 여기에 걸린다. 응답 헤더의 Date 값으로 대신해도 된다 — 화면이 브라우저 시계를 쓰면 사용자 시계가 어긋난 만큼 틀린 수를 말한다 |
| `POST /approvals/{id}:decide` | `decideApproval` | 승인·반려 |
| `GET /audit/access?denied=&keyword=` | `fetchAccessLogs` | → `AccessLogEntry[]`. 거부는 `deniedReason` 필수 |
| `GET /audit/coverage` | `fetchLogGaps` | → 로그에 **남지 않는 것** 목록. 없으면 화면이 '여기 있는 게 전부'로 그리게 된다 |
| `GET /access-rules` | `fetchBlockRules` | → `BlockRule[]`. 만료된 규칙도 함께 준다 — 화면이 만료를 가려서 말한다 |
| `POST /access-rules` | `createBlockRule` | 차단 규칙 추가 |
| `GET /llm/models` | `fetchModels` | → `ModelEntry[]` (`entities/llmops/model.ts`). 중지 모델은 `stoppedReason` 필수 |
| `PATCH /llm/models/{id}` | `updateModelParams` | 온도 등 파라미터. 서비스 전체 답변이 바뀌는 설정이다 |
| `GET /llm/rerank-pipelines` | `fetchPipelines` | → `RerankPipeline[]`. **안 잰 효과는 `null`** — 0 금지, §2-8 |
| `GET /llm/guardrails` | `fetchGuardrails` | → `GuardrailRule[]`. `riskIfOff`(껐을 때 통과하는 것) 필수 |
| `PATCH /llm/guardrails/{id}` | `toggleGuardrail` | 규칙 켜기·끄기 |
| `GET /llm/confidence-policy` | `fetchConfidencePolicy` | → `ConfidencePolicy`. 임계값과 **아래일 때 하는 일**을 함께 |
| `GET /quality/reviews` | `fetchQualityReviews` | → `QualityReview[]`. 판정에는 검토 의견(`note`)을 함께 |
| `GET /analytics/usage?mode=` | `fetchUsageEntries` | → `UsageEntry[]` (`entities/analytics/model.ts`). **질의 본문은 넣지 않는다** — §3-8 |
| `GET /analytics/satisfaction` | `fetchSurvey` | → `SatisfactionSurvey`. 보낸 수(`sent`)와 답한 수(`responded`)를 함께 — 평균만 오면 표본을 알 수 없다 |
| `POST /analytics/satisfaction:send` | `sendSurvey` | 조사 발송 |
| `GET /analytics/stats?window=` | `fetchUsageStats` | `window`=`7d`\|`30d`\|`quarter` → `UsageStats`. `avgSeconds`는 성공한 요청 기준, 제외된 `failedQueries`를 함께 |
| `GET /analytics/report-sections` | `fetchReportSections` | → `ReportSection[]` (`entities/analytics/model.ts`). 만들 수 없는 항목도 이유와 함께 준다 |
| `POST /analytics/reports` | `buildReport` | 리포트 파일 생성 |
| `GET /audit/logs?kind=` | `fetchOpLogs` | `kind`=`export`\|`access`\|`operation`\|`query` → `OpLogEntry[]`. **접속 로그는 `/audit/access`와 같은 자원**이어야 한다 |
| `GET /audit/logs.csv?kind=` | `exportLogsCsv` | 서버가 파일을 만든다 — 화면에 보이는 것만 모으면 조회 조건 밖 기록이 빠진다 |
| `GET /usage/buckets` | `fetchUsageBuckets` | → `UsageBucket[]`. 금액이 아니라 **토큰 수**로 준다(단가 미정) |
| `GET /usage/period` | `fetchBillingMonth` | → `BillingMonth`. 청구 주기의 경과·총 일수. **'며칠 뒤 한도 초과'가 여기에 걸린다** — 주기는 요금제마다 달라 브라우저가 달력으로 유추할 수 없다 |
| `GET /notices` | `fetchManagedNotices` | → `Notice[]` (`entities/notice/model.ts`). 관리자와 포털이 **같은 엔드포인트**를 쓴다 — 따로 두면 고쳐도 포털에 안 나온다 |
| `GET /chat/faq` | `fetchManagedFaq` | → `FaqItem[]` (`entities/chat/model.ts`). 위와 같은 이유로 포털과 같은 자원 |
| `POST /notices` | `saveNotice` | 공지 등록 |
| `GET /integrations/hr` | `fetchHrSync` | → `HrSyncState` (`entities/sysops/model.ts`). **처리 실패는 사유와 함께** — 퇴직이 밀리면 계정이 열려 있다 |
| `POST /integrations/hr:sync` | `runHrSync` | 수동 동기화 |
| `GET /apis` | `fetchApis` | → `ApiEntry[]`. **키 원문은 응답에 넣지 않는다** — §2-9 |
| `POST /apis/{id}/keys` | `reissueApiKey` | 재발급. 키 원문은 이 응답에 **한 번만** 담고 이후 조회로는 못 본다 |
| `GET /prompts` | `fetchPrompts` | → `PromptEntry[]`. 바꿨을 때의 영향(`affects`)을 함께 |
| `GET /guardrails/hits` | `fetchGuardrailHits` | → `GuardrailHit[]` (`entities/compliance/model.ts`). **걸린 원문은 넣지 않는다** — 종류만 |
| `GET /compliance/systems` | `fetchAiSystems` | → `AiSystem[]`. 판정에는 근거(`reason`)와 운영 여부(`inService`)를 함께 |
| `GET /compliance/labeling` | `fetchLabelRules` | → `LabelRule[]` |
| `GET /compliance/assessments` | `fetchAssessments` | → `Assessment[]`. 안 끝난 것은 무엇이 남았는지(`remaining`) |
| `GET /knowledge/areas` | `fetchAreas` | → `KnowledgeArea[]` (`entities/knowledgebase/model.ts`). **등록 수와 검색 가능 수를 따로** — 하나만 오면 '못 찾는 문서'를 그릴 수 없다 |
| `GET /knowledge/index?area=` | `fetchIndexEntries` | → `IndexEntry[]`. 색인 안 된 문서는 사유(`reason`) 필수 |
| `GET /knowledge/rag-config` | `fetchRagConfig` | → `RagConfig`. 재색인 진행률(`reindexedRatio`)을 함께 |
| `POST /knowledge/areas/{id}:reindex` | `runReindex` | 재색인 |
| `GET /agents/ops` | `fetchAgentOps` | → `AgentOps[]` (`entities/agentops/model.ts`). **목록이 아니라 운영 정보만** — 카탈로그는 한 곳이어야 한다 |
| `PATCH /agents/{id}` | `setAgentExposure` | 포털 노출 전환 |
| `GET /apps` | `fetchAppSurfaces` | → `AppSurface[]`. 못 여는 앱은 사유(`blockedReason`)와 함께 |
| `GET /apps/domains` | `fetchDomainExposure` | → `DomainExposure[]`. 포털의 선택 가능 여부와 **같은 기준**이어야 한다 |
| `GET /packs` | `fetchPacks` | → `DomainPack[]` (`entities/packops/model.ts`). **포털의 선택 가능 여부와 같은 근거**여야 한다 |
| `POST /packs` | `createPack` | 팩 생성 |
| `GET /tools` | `fetchTools` | → `ToolEntry[]`. 끊기면 못 도는 에이전트(`usedBy`)를 함께 |
| `GET /deployments` | `fetchDeployments` | → `Deployment[]`. 검증·운영 버전을 모두 준다 — 화면이 미반영을 계산한다 |
| `POST /deployments:promote` | `promote` | 운영 반영 |
| `GET /datasets` | `fetchDatasets` | → `Dataset[]` (`entities/mlops/model.ts`). 학습·평가 겸용 여부와 출처를 함께 |
| `GET /devenv/workspaces` | `fetchWorkspaces` | → `Workspace[]` (`entities/mlops/model.ts`). GPU를 잡는 **개발 방**이다 — 포털의 업무 공간(`GET /workspaces`)과 다른 자원. 마지막 계산 시각(`lastActiveAt`)이 있어야 유휴를 잰다 |
| `POST /devenv/workspaces/{id}:release` | `releaseWorkspace` | 자원 회수 |
| `GET /models/versions` | `fetchModelVersions` | → `ModelVersion[]`. **계보**(`trainJobId`·`datasetIds`)를 함께 — 없으면 삭제 요청에 답할 수 없다 |
| `GET /training/runs` | `fetchTrainRuns` | → `TrainRun[]`. 트레이너 현황(`/training/report`)과 **같은 작업**의 상세다 |
| `GET /evaluations` | `fetchEvalResults` | → `EvalResult[]`. **학습셋과 겹쳤는지**(`trustworthy`)를 서버가 판정해 준다 |
| `GET /integrations` | `fetchIntegrations` | → `Integration[]`. 끊기면 무엇이 멈추는지(`impactIfDown`) 필수 |
| `GET /training/report?window=` | `fetchTrainerReport` | `window`=`day`\|`week`\|`month` → `TrainerReport`. 실패 작업에는 `note`(사유)가 있어야 한다 |

`makeUserMessage`는 서버를 부르지 않는다. 사용자가 방금 친 말을 화면에 얹는 클라이언트 함수다.

### 2-1. 이름에 `:`이 붙은 것들

`POST /knowledge:search` 처럼 콜론을 쓴 것은 **자원을 만들지 않는 동작**이다.
검색·인식·매핑은 결과를 저장하지 않고 돌려주기만 한다.
백엔드가 결과를 저장하고 id를 주는 쪽을 원하면 `POST /searches` 처럼 자원형으로 바꾸면 된다 —
그 경우 화면은 id를 받아 두었다가 재조회할 수 있으므로 오히려 낫다. 정해 주면 맞춘다.

### 2-2. 처리 시간이 긴 것

OCR·번역·분석·보고서는 지금 fixture에서 4~15초 범위다.
**동기 응답으로 제안**하되, 실제 처리가 30초를 넘으면 `202 Accepted` + 작업 id + 폴링으로 바꾸자.
그 경우 바뀌는 곳은 `shared/api`의 해당 함수 하나이고 화면은 그대로다 —
화면은 이미 '진행 중' 상태를 갖고 있다.

### 2-3. 라이브 지표

지금은 예시 곡선을 통째로 받아 화면이 시간에 맞춰 재생한다.
실제로는 **값이 계속 바뀌므로** 다음 중 하나가 맞다 — 백엔드가 정해 주면 맞춘다.

- 짧은 주기 폴링 (`GET /metrics/live?since=…`) — 구현이 단순하다
- 서버 전송 이벤트(SSE) 또는 WebSocket — 지연이 짧다

어느 쪽이든 바뀌는 곳은 `shared/api/metrics.ts` 하나다. 화면은 '지금 값'만 받으면 된다.

### 2-4. 업로드

`entities/upload/model.ts`에 형식·용량 제약이 있다(문서 50MB / 음성 200MB / 스캔 50MB / 데이터 100MB).
지금은 클라이언트가 먼저 거른다. **서버가 제약을 응답으로 내려 주면 그것을 쓰겠다** —
양쪽에 상수를 두면 반드시 어긋난다. 그 전까지는 위 값이 제안값이다.

업로드는 파일을 얹는 일이 아니라 **서버가 본문을 파싱해 돌려주는 일**이다.
`BusinessDocument.text`(추출 본문)가 응답에 있어야 요약·검토·번역이 이어진다.

### 2-5. 지도가 답변에 붙는 이유

사업장별 지표는 **별도 호출을 만들지 않고 챗봇 응답에 실어** 제안한다.
질문을 해석해 '지도를 붙일지'를 정하는 것은 서버이고, 화면이 그 판단을 다시 하면
두 곳이 어긋난다. 화면은 `map`이 있으면 그리고 없으면 안 그린다.

값이 없는 사업장은 **빼지 말고 `value: null` + 이유(`missingReason`)로** 달라고 요청한다.
빼서 보내면 화면이 '전 사업장이 이렇다'로 그리게 된다. 0으로 보내는 것은 더 나쁘다 —
가동률 0%인 공장이 있는 것으로 읽힌다.

격자 위치(`col`/`row`)는 지금 프론트 fixture가 갖고 있다. 실제 좌표(위경도)를 줄 수 있으면
지도 위에 그리겠다. 없으면 지금처럼 **배치 도식**이라고 밝히고 그린다.

### 2-6. 브라우저에 남기는 것

대화 기록과 공지 읽음 표시는 **브라우저에만** 저장한다(서버로 보내지 않는다).
보관 기간 정책이 정해지기 전이라 지우는 방법을 함께 뒀다.
서버가 대화 이력을 갖는 쪽으로 정해지면 `POST /conversations` 계열이 필요해진다 —
그때 다시 제안한다. 지금 미리 만들지 않는다.

### 2-7. 관리자 대시보드에 요청하는 것

세 가지를 요청한다. 없으면 화면이 관리자에게 쓸모없어진다.

1. **구간은 질의 조건으로.** `window`를 받아 그 구간의 집계를 준다. 전 기간을 내려주고
   화면이 자르는 방식은 쓰지 않는다 — '최근 1시간'을 보려고 7일치를 받게 된다.
2. **나쁜 상태에는 사유와 조치.** `level: 'warn'`만 오면 관리자는 손쓸 수 없다.
   `reason`(무엇이 잘못됐나)과 `action`(무엇을 해야 하나)을 함께 달라.
   상태를 아는 것과 조치할 수 있는 것은 다르다.
3. **판정이 아니라 원시 값.** 과부하 여부·색·정렬은 화면이 정한다. 서버는
   사용률·온도·전력만 준다. 판정 기준이 서버와 화면 두 곳에 있으면 요약 숫자와
   개별 배지가 어긋난다.

이 값들이 붙기 전까지 화면은 `서버 미연결 — 예시 값` 배지를 단다.
**배지가 사라지는 것이 곧 연결 확인**이다.

### 2-8. 측정값에 붙여야 하는 것

'정확도 +18.4%' 같은 숫자는 **언제 몇 건으로 쟀는지 없으면 뜻이 없다.** 그래서
효과 측정값은 `{gain, samples, measuredOn}` 묶음으로 요청한다.

**아직 안 잰 것은 `null`로 준다.** `0`으로 주면 화면이 '효과 없음'으로 그리고
평균에 섞여 전체 평균을 끌어내린다. 화면은 `null`을 '측정 전'으로 쓰고 평균에서 뺀다.

같은 이유로 사용자 피드백 집계도 **표본 범위**를 함께 요청한다. 지금 화면은
브라우저에 남은 것만 세고 있고, 그 사실을 숫자 옆에 적어 두었다.

### 2-9. 키를 응답에 넣지 않는다

API 키·토큰 원문은 **조회 응답에 넣지 않기를 요청한다.** 발급 응답에 한 번만 담고,
그 뒤로는 서버도 원문을 갖지 않는 편이 낫다(해시만 보관).

관리 화면에 키를 늘어놓으면 그 화면을 여는 사람 모두가 모든 키를 갖게 되고,
화면은 캡처되고 공유된다. 키를 잃어버린 경우의 정답은 '다시 보기'가 아니라 '재발급'이다.

같은 이유로 응답 어디에도 비밀번호·시크릿을 넣지 않는다. 지금 fixture에도 두지 않았고,
테스트가 그것을 확인한다.

## 3. 결정 요청 8건 (+ 테넌시에 딸린 1건)

프론트가 정하면 안 되는 것들이다. **추측으로 채우지 않았다.**
다만 비워 두기만 하면 회신이 늦으므로, 각 항목에 **프론트 권장안**과
**안 정하면 생기는 일**을 붙였다. 권장안대로 가면 "그대로 갑니다" 한 줄로 끝난다.

각 항목의 형식: 질문 / 권장 / 안 정하면 / 정해지면 프론트가 하는 일

---

**3-1. 인증** — 세션인가 토큰인가, 갱신은 어떻게, 만료되면 화면은 무엇을 하나

- **권장**: `Authorization: Bearer` + 짧은 액세스 토큰 + 리프레시. 401이면 화면이 로그인으로 보낸다
- **안 정하면**: 상태 변경(`PATCH`·`POST`)이 전부 막힌다. 지금 화면은 **실패를 그대로 알린다**
  (D-009) — "저장되지 않았습니다"라고 말하고 값을 되돌린다. 성공한 척하지 않는다
- **정해지면**: `shared/api`에 헤더 주입 한 곳 추가. 화면은 손대지 않는다

**3-2. 테넌시** — 발주처 구분을 경로로(`/domains/{id}/documents`) 할지 헤더로 할지

- **권장**: 헤더(`X-Domain-Id`). 경로에 넣으면 98개 주소가 전부 길어지고,
  발주처가 하나뿐인 배포에서도 경로에 늘 껴 있어야 한다
- **안 정하면**: 발주처가 둘 이상이 되는 순간 문서·지표가 섞인다. 화면은 팩 4종을
  이미 갈라 두었다 — 서버가 안 가르면 그 경계가 무의미해진다
- **정해지면**: 헤더면 `shared/api` 한 곳, 경로면 98개 주소를 다시 적는다. **헤더 쪽이 훨씬 싸다**

**3-2-1. 관리자는 어느 발주처인가** (테넌시에 딸린 질문)

- **사실**: 사용자 포털은 셸이 발주처를 들고 있지만 **관리자는 발주처 소속이 아니다.**
  그런데 에이전트 정의·시나리오는 발주처마다 다른 데이터라 관리자도 어느 발주처인지
  말해야 한다. 지금은 화면이 고른 발주처를 경계 함수에 넘긴다
  (`fetchAgentDefs(domainId)` — 서버가 붙으면 그 값이 헤더가 된다)
- **정해 주셔야 하는 것**: 운영 담당자 토큰이 **다른 발주처의 정의를 읽을 수 있는가**,
  읽을 수 있다면 어디까지인가(정의만인가, 업무 문서까지인가)
- **안 정하면**: 관리자 화면이 전 발주처를 다 보여 주는 채로 남는다. 발주처 담당자가
  관리자에 들어오면 **남의 발주처 정의가 보인다**

**3-3. 권한 — 보안 등급별 접근** (`일반`/`내부`/`대외비`)

- **권장**: **서버가 거른다.** 그리고 **거른 건수를 응답에 담는다**(`excludedBySecurity`)
- **안 정하면**: 지금 지식 검색은 클라이언트 필터다 — 응답에 대외비가 실려 오고 화면이 숨긴다.
  네트워크 탭을 열면 다 보인다. 이건 화면으로 못 고친다
- **정해지면**: 클라이언트 필터를 지운다. 건수 필드가 없으면 사용자는
  **'없다'와 '안 보여 준다'를 구분할 수 없다** — 그래서 필드를 함께 요청한다

**3-4. 감사 로그 범위** — 누구의 무엇을 남기나

- **권장**: 조회·생성·설정 변경 3종. 관리자 화면(`감사 추적`)은 이미 '기록이 어디에 남는지'를
  `server`/`browser`/`none`으로 구분해 그린다
- **안 정하면**: `none`인 책무가 남는다. 화면은 그것을 **'이행했지만 증명할 수 없음'**으로 표시한다
- **정해지면**: `GET /compliance/evidence`의 `store` 값이 실제 값이 된다

**3-5. 파일 보관** — 업로드본 보관 기간과 삭제 경로

- **권장**: 처리 후 30일, `DELETE /documents/{id}`
- **안 정하면**: 업로드는 지금도 **실패만 반환한다**(D-009). 지어낸 성공을 보여 주지 않는다
- **정해지면**: `uploadDocument`·`uploadDataset` 두 함수만 바꾼다

**3-6. 동시성·상한** — 분당 요청 수, 대용량 파일 동시 업로드

- **권장**: 사용자당 분당 60, 업로드 동시 2건. 초과는 `429` + `retryAfterSeconds`
- **안 정하면**: 화면이 재시도 간격을 임의로 정하게 된다 — 서버가 더 힘들어진다
- **정해지면**: `429`를 오류 문구로 그대로 띄우고, 값이 있으면 그만큼 기다린다

**3-7. 질의 본문 보관 여부** — 사용자가 무엇을 물었는지 저장하나

- **권장**: **저장하지 않는다.** 지금 접근 로그·이용 이력 두 화면이 그 전제로 통일돼 있다
  (이전 데모는 이용 이력에 본문을 그대로 보여 줬다)
- **안 정하면**: 두 화면이 서로 다른 말을 하게 된다
- **정해지면(저장하기로)**: 보관 기간·열람 권한·마스킹 범위가 **함께** 필요하다.
  셋 중 하나라도 없으면 화면을 만들 수 없다

**3-8. 오류 코드 체계** — `ApiError.code` 목록

- **권장**: `<자원>_<사유>` 대문자 스네이크(`DOCUMENT_NOT_FOUND`). `message`는 한국어 문장
- **안 정하면**: 화면이 `message`만 띄운다. 재시도 가능·불가를 구분할 수 없다
- **정해지면**: 재시도 가능한 코드만 '다시 시도' 버튼을 붙인다

## 4. 이 문서가 코드와 갈라지지 않게 하는 법

`src/shared/api/`의 모든 fixture 기반 함수에는 다음 표시가 있다.

```ts
// TODO(api-미확정): POST /summaries 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
```

`src/shared/api/contract.test.ts`가 매번 확인한다.

- 표시에 적힌 엔드포인트가 **이 문서에 없으면 실패**
- 이 문서에 적힌 함수 이름이 **코드에 없으면 실패**
- 이 문서의 주소가 **`docs/api/openapi.json`에 없으면 실패**(그 반대도)

문서만 고치거나 코드만 고치면 테스트가 깨진다. 둘을 함께 고치는 것이 정상 경로다.

CI는 여기에 더해 `npm run api:spec`을 다시 돌리고 `git diff --exit-code`를 본다 —
타입만 고치고 명세를 다시 안 만들면 **백엔드가 받는 파일이 조용히 낡기** 때문이다.

## 5. 함께 보내는 것

| 파일 | 무엇 | 어떻게 만들었나 |
|---|---|---|
| `docs/API-PROPOSAL.md` | 이 문서 — 왜 이 필드가 필요한지 | 사람이 씀 |
| `docs/api/openapi.yaml` | OpenAPI 3.1 명세(사람이 읽는 쪽) | `npm run api:spec` |
| `docs/api/openapi.json` | 같은 명세(도구·검사가 읽는 쪽) | 〃 |
| `docs/api/USAGE.md` | **주소별 사용처** — 이걸 바꾸면 어느 화면이 깨지나 | 〃 |

명세의 스키마는 손으로 적지 않았다. `src/entities/<도메인>/model.ts`에서 뽑았고
**그 파일이 정본**이다. 한국어 주석도 그대로 `description`에 실린다.

Swagger UI·Postman·코드 생성기에 `openapi.yaml`을 그대로 넣으면 된다.
인증·서버 주소는 비어 있다 — §3-1, §3-2가 정해지면 채운다.

### 명세를 만들면서 드러난 것

문서로만 있을 때는 안 보이던 것이 기계로 뽑으니 나왔다.

| 발견 | 무엇이 문제였나 | 어떻게 했나 |
|---|---|---|
| `GET /datasets`가 둘 | 분석에 넣는 **데이터 파일**과 학습·평가 **데이터셋**이 같은 주소를 쓰고 있었다. 응답 형태가 서로 다르다 | 분석 쪽을 `/analysis/datasets`로 나눔 |
| `GET /workspaces`가 둘 | 포털의 **업무 공간**과 GPU를 잡는 **개발 방**이 같은 주소였다 | 개발 쪽을 `/devenv/workspaces`로 나눔 |
| `MappingRequest`가 딴 곳에 | 요청 타입 13개 중 12개는 엔티티에 있는데 이것만 경계 파일에 있었다 | 엔티티로 옮김 |
| `GET /glossary`를 **아무도 안 부름** | 만들어 뒀지만 화면이 쓰지 않았다. 번역 결과에 적용 용어가 이미 실려 온다 | 제안에서 뺌 — 안 만들어도 된다 |

지금 제안하는 주소 중 **화면이 안 부르는 것은 0개**다(`docs/api/USAGE.md` 마지막 줄).

## 6. 붙이는 순서

한 번에 다 붙일 필요가 없다. `shared/api`의 함수를 하나씩 바꾸면 그 화면만 실서비스가 된다.
**화면 코드는 손대지 않는다** — 그게 이 경계를 둔 이유다.

| 단계 | 붙이는 것 | 살아나는 화면 | 먼저 필요한 결정 |
|---|---|---|---|
| 1 | `/domains`·`/workspaces`·`/notices`·`/chat/faq`·`/documents` | 포털 진입, 사이드바, 공지, 문서 목록 | §3-2 테넌시 |
| 2 | `/chat/messages`·`/knowledge:search`·`/regulations:search` | 챗봇·지식 검색·규정 조회 (제품의 핵심) | §3-3 권한(서버 필터) |
| 3 | 에이전트 실행 9종(`/summaries`·`/translations`·…) | 에이전트 13종 | §3-5 파일 보관, §3-6 상한 |
| 4 | 관리자 조회 계열(`/infra/*`·`/users`·`/analytics/*`·…) | 관리자 44화면 | §3-1 인증, §3-4 감사 |
| 5 | 상태 변경(`PATCH`·`POST … :action`) | 승인·차단·배포 등 실제로 바꾸는 것 | §3-1 인증 필수 |

**1·2단계만 붙어도 사용자 포털이 실제로 돕니다.** 관리자는 그 뒤여도 된다 —
지금은 모든 인프라 수치에 `서버 미연결 — 예시 값` 배지가 붙어 있어 거짓으로 읽히지 않는다.

상태 변경(5단계)을 마지막에 둔 이유: 인증이 없으면 누가 눌렀는지 모른 채 값이 바뀐다.
그때까지 화면은 **실패를 그대로 알린다**(D-009).
