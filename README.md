# AgentQ

조직 업무에 생성형 AI 에이전트를 붙이는 플랫폼. 발주처(도메인)를 갈아끼울 수 있는 구조가 핵심이다.

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

## 작업 규칙

AI로 개발할 때는 `AGENTS.md`와 `docs/ai-development-handoff-guidelines.md`를 먼저 읽을 것.
