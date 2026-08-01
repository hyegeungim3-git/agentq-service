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
     떠 있으면 reuseExistingServer가 '남의 앱'을 테스트한다(실제로 겪었다). */
  webServer: {
    command: 'npm run dev -- --port 5180 --strictPort',
    url: 'http://localhost:5180',
    reuseExistingServer: !process.env.CI,
  },
})
