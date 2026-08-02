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
| `GET /datasets` | `fetchDatasets` | → `Dataset[]` (`entities/dataset/model.ts`) |
| `POST /datasets (multipart)` | `uploadDataset` | 파일 → `Dataset` |
| `POST /summaries` | `createSummary` | `SummaryRequest` → `SummaryResult` (`entities/summary/model.ts`) |
| `POST /translations` | `createTranslation` | `TranslationRequest` + 원문 → `TranslationResult` (`entities/translation/model.ts`) |
| `GET /glossary` | `fetchGlossary` | → `GlossaryEntry[]` |
| `POST /reviews` | `createReview` | `ReviewRequest` → `ReviewResult` (`entities/review/model.ts`) |
| `POST /reports` | `createReport` | `ReportRequest` → `ReportResult` (`entities/report/model.ts`) |
| `POST /minutes` | `createMinutes` | `MeetingRequest` → `MeetingResult` (`entities/meeting/model.ts`) |
| `POST /regulations:search` | `askRegulation` | `RegulationRequest` → `RegulationAnswer` (`entities/regulation/model.ts`) |
| `GET /knowledge-bases` | `fetchKnowledgeBases` | → `KnowledgeBase[]` (`entities/knowledge/model.ts`) |
| `POST /knowledge:search` | `searchKnowledge` | `KnowledgeRequest` → `KnowledgeResult` |
| `POST /ocr:recognize` | `recognizeDocument` | `OcrRequest` → `OcrResult` (`entities/ocr/model.ts`) |
| `POST /queries` | `runQuery` | `QueryRequest` → `QueryResult` (`entities/dataquery/model.ts`) |
| `POST /mapping:run` | `runMapping` | `MappingRequest` → `MappingResult` (`entities/mapping/model.ts`) |
| `POST /analyses` | `analyzeData` | `AnalysisRequest` → `AnalysisResult` (`entities/analysis/model.ts`) |
| `POST /safety-plans` | `createSafetyPlan` | `SafetyRequest` → `SafetyPlan` (`entities/safety/model.ts`) |
| `POST /chat/messages` | `sendMessage` | 질문 문자열 → `ChatMessage` (`entities/chat/model.ts`). 사업장별 지표를 묻는 질문이면 `map`(`entities/mapintel/model.ts`)이 함께 온다 — 별도 호출을 만들지 않은 이유는 §2-5 |
| `GET /chat/faq` | `fetchFaq` | → `FaqItem[]` |
| `GET /metrics/live` | `fetchLiveMetrics` | → `LiveMetric[]` (`entities/metric/model.ts`) — 실제로는 스트리밍/폴링이 맞다. §2-3 참조 |
| `GET /signals` | `fetchSignals` | → `WorkSignal[]` (`entities/signal/model.ts`) — 알림 센터·오늘의 브리핑이 함께 쓴다 |
| `GET /infra/cluster` | `fetchCluster` | → `ClusterResource` (`entities/infra/model.ts`) — 비율은 0~1 |
| `GET /infra/nodes` | `fetchNodes` | → `NodeInfo[]` |
| `GET /infra/pods?window=` | `fetchPods` | `window`=`1h`\|`6h`\|`24h`\|`7d` → `PodInfo[]`. 구간은 **서버 질의 조건**이다 — §2-7 |
| `GET /infra/services` | `fetchServices` | → `ServiceStatus[]`. 정상이 아니면 `reason`·`action`이 있어야 한다 — §2-7 |
| `GET /infra/gpus` | `fetchGpuNodes` | → `GpuNode[]`. 과부하 판정은 화면이 한다(원시 값만 준다) |
| `GET /users?keyword=&role=&state=` | `fetchUsers` | → `PlatformUser[]` (`entities/user/model.ts`). **거르기는 서버가 한다** — §3-3 |
| `PATCH /users/{id}` | `updateUserState` | 상태 변경. 인증·권한이 정해지기 전까지 화면은 실패를 그대로 알린다 |
| `GET /approvals` | `fetchApprovals` | → `ApprovalRequest[]`. 신청 사유가 없으면 `null`(빈 문자열 금지) |
| `POST /approvals/{id}:decide` | `decideApproval` | 승인·반려 |
| `GET /audit/access?denied=&keyword=` | `fetchAccessLogs` | → `AccessLogEntry[]`. 거부는 `deniedReason` 필수 |
| `GET /audit/coverage` | `fetchLogGaps` | → 로그에 **남지 않는 것** 목록. 없으면 화면이 '여기 있는 게 전부'로 그리게 된다 |
| `GET /access-rules` | `fetchBlockRules` | → `BlockRule[]`. 만료된 규칙도 함께 준다 — 화면이 만료를 가려서 말한다 |
| `POST /access-rules` | `createBlockRule` | 차단 규칙 추가 |
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

## 3. 백엔드가 정해 주어야 하는 것

프론트가 정하면 안 되는 것들이라 비워 둔다. **추측으로 채우지 않았다.**

1. **인증** — 방식(세션/토큰), 갱신, 만료 시 화면 동작
2. **테넌시** — 발주처(도메인) 구분을 경로로 할지(`/domains/{id}/documents`) 헤더로 할지
3. **권한** — 문서 보안 등급(`일반/내부/대외비`)별 접근 규칙. 지금 지식 검색은 클라이언트 필터인데,
   실제로는 **서버가 걸러야 한다**. 거른 건수는 응답으로 알려 주기를 요청한다
   (`excludedBySecurity` — 없으면 사용자는 '없다'와 '안 보여 준다'를 구분할 수 없다)
4. **감사 로그** — 누가 무엇을 조회·생성했는지 기록 범위
5. **파일 보관** — 업로드본 보관 기간, 삭제 요청 경로
6. **동시성·상한** — 분당 요청 수, 대용량 파일 동시 업로드
7. **오류 코드 체계** — 위 `code` 값의 목록

## 4. 이 문서가 코드와 갈라지지 않게 하는 법

`src/shared/api/`의 모든 fixture 기반 함수에는 다음 표시가 있다.

```ts
// TODO(api-미확정): POST /summaries 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
```

`src/shared/api/contract.test.ts`가 매번 확인한다.

- 표시에 적힌 엔드포인트가 **이 문서에 없으면 실패**
- 이 문서에 적힌 함수 이름이 **코드에 없으면 실패**

문서만 고치거나 코드만 고치면 테스트가 깨진다. 둘을 함께 고치는 것이 정상 경로다.
