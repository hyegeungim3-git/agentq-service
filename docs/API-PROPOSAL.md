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
| `POST /chat/messages` | `sendMessage` | 질문 문자열 → `ChatMessage` (`entities/chat/model.ts`) |
| `GET /chat/faq` | `fetchFaq` | → `FaqItem[]` |
| `GET /signals` | `fetchSignals` | → `WorkSignal[]` (`entities/signal/model.ts`) — 알림 센터·오늘의 브리핑이 함께 쓴다 |

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

### 2-3. 업로드

`entities/upload/model.ts`에 형식·용량 제약이 있다(문서 50MB / 음성 200MB / 스캔 50MB / 데이터 100MB).
지금은 클라이언트가 먼저 거른다. **서버가 제약을 응답으로 내려 주면 그것을 쓰겠다** —
양쪽에 상수를 두면 반드시 어긋난다. 그 전까지는 위 값이 제안값이다.

업로드는 파일을 얹는 일이 아니라 **서버가 본문을 파싱해 돌려주는 일**이다.
`BusinessDocument.text`(추출 본문)가 응답에 있어야 요약·검토·번역이 이어진다.

### 2-4. 브라우저에 남기는 것

대화 기록과 공지 읽음 표시는 **브라우저에만** 저장한다(서버로 보내지 않는다).
보관 기간 정책이 정해지기 전이라 지우는 방법을 함께 뒀다.
서버가 대화 이력을 갖는 쪽으로 정해지면 `POST /conversations` 계열이 필요해진다 —
그때 다시 제안한다. 지금 미리 만들지 않는다.

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
