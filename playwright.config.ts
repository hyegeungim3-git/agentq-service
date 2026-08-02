import { defineConfig, devices } from '@playwright/test'

/* E2E — agent-rules §10 "주요 사용자 흐름 통합 또는 E2E 테스트"
   데스크톱과 최소 지원 모바일 두 폭을 함께 돌린다(§8 반응형 확인 조항). */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:5180', trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  /* 포트를 5180으로 고정한다 — 5173은 흔한 기본값이라 다른 프로젝트의 dev 서버가
     떠 있으면 reuseExistingServer가 '남의 앱'을 테스트한다(실제로 겪었다).

     CI에서는 dev가 아니라 production preview를 띄운다.
     dev 서버는 모듈을 요청 시점에 컴파일해서, 지연 로딩 청크(차트)를 여러 워커가
     동시에 처음 요청하면 5초 안에 안 온다 — 실제로 차트를 넣은 직후 7건이
     타임아웃으로 실패하고 재실행하니 통과했다. 그런 '두 번째에 되는' 테스트는
     CI에서 무작위로 깨진다. preview는 이미 빌드된 파일을 주므로 그 변수가 사라진다. */
  webServer: {
    command: process.env.CI
      ? 'npm run build && npm run preview -- --port 5180 --strictPort'
      : 'npm run dev -- --port 5180 --strictPort',
    url: 'http://localhost:5180',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
