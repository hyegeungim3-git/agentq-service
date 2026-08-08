# AgentQ

조직 업무에 생성형 AI 에이전트를 붙이는 플랫폼. 발주처(도메인)를 갈아끼울 수 있는 구조가 핵심이다.

## 현재 상태

| | |
|---|---|
| 사용자 포털 | 분야 선택 → **셸(일반·에이전트·보안 탭)** → 에이전트 13종 + 복합 업무 릴레이 |
| 발주처 | **4종 전부 업무 데이터 보유** — 제조(한빛정밀)·공공(한국부동산원)·행정(한성시청)·의료(새빛대학교병원) |
| 관리자 | **화면 50개** (메뉴 61개, 준비 중 0개) |
| 백엔드 | **미연결** — 데이터는 전부 `src/fixtures/`, 교체 지점은 `src/shared/api/` 경계 함수 144개 |
| 파일 업로드 | 형식·용량 검사와 화면은 동작. 전송은 서버 연결 후 (`docs/DECISIONS.md` D-009) |
| 검증 | 단위 541 · E2E 278 · 접근성 58 · 첫 화면 용량 상한 — 전부 CI 게이트 |

> 이 표의 숫자는 `scripts/readme-sync.test.ts`가 코드와 대조한다. 손으로 고치면 검사가 깨진다 —
> 실제로 이 표가 낡은 채로 남아 '관리자 미착수'라고 말하고 있었다.

이 저장소는 목업 데모를 **실제 API를 붙일 수 있는 형태로 다시 세운 것**이다.
그래서 fixture를 화면 표시용이 아니라 **API 응답이 될 수 있는 형태**(원시 값·코드·ID)로 쓴다.
`{ value: '4,380건', tone: 'base' }` 같은 형태는 서버가 줄 수 없고, 그대로 두면 API를 붙일 때 전부 다시 써야 한다.
데이터 접근은 `src/shared/api/`를 통과하며, 서버가 정해지면 그 경계 안에서만 교체한다.

에이전트 화면은 공통으로 **AI가 못 한 것을 숨기지 않는다** — 비어 있는 보고서 항목,
담당자가 정해지지 않은 회의 결정, 근거 없는 챗봇 답변, 신뢰도 낮은 OCR 줄,
AI로 표준화되지 않는 태그를 각 화면이 먼저 말한다.

## 시작하기

```bash
npm install
npm run dev
```

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run lint` | ESLint (react-hooks v7 포함) |
| `npm run typecheck` | TypeScript 엄격 검사 |
| `npm run test` | Vitest 단위·화면 테스트 |
| `npm run e2e` | Playwright E2E (데스크톱·모바일) |
| `npm run build` | production build |
| `npm run verify` | lint → typecheck → test → build 일괄 |

## ⚠️ 경로 제약

**프로젝트를 한글이 포함된 경로에 두지 말 것.** 모듈 수가 늘면 `vite build`가
`transformed` 직후 네이티브 크래시로 조용히 죽는다. 근거와 실측은 `AGENTS.md` §14.

## 구조

```text
src/
├─ app/        앱 초기화, 라우팅, 전역 오류 처리
├─ pages/      URL로 접근하는 화면
├─ widgets/    여러 기능을 조합한 큰 화면 영역
├─ features/   사용자 행동과 업무 기능
├─ entities/   핵심 도메인 데이터와 타입
├─ shared/     여러 도메인에서 재사용하는 기반 코드 (api 경계 포함)
└─ fixtures/   예시 데이터
```

`shared`는 특정 페이지나 업무 도메인을 알지 않는다. 상대경로 대신 경로 별칭(`@shared` 등)을
쓰는 이유가 이것이다 — `../../../`는 의존 방향을 숨긴다.

## 이어받는 개발자라면

**`docs/HANDOVER.md`부터 읽으십시오.** 무엇이 되고 무엇이 안 되는지, 서버를 붙일 때
어디를 만지는지, 무엇이 임시인지, 어떤 검사가 무엇을 막아 주는지가 그 한 곳에 있다.

## 작업 규칙

AI로 개발할 때는 `AGENTS.md`와 `docs/ai-development-handoff-guidelines.md`를 먼저 읽을 것.
이전 데모와 무엇이 왜 달라졌는지는 `docs/REBUILD-NOTES.md`.
기술 결정 기록은 `docs/DECISIONS.md`, 규칙 준수 대조는 `docs/RULE-AUDIT.md`,
남은 결정 사항은 `AGENTS.md` §20.
