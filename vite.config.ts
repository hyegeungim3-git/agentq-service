/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  // GitHub Pages는 저장소 이름이 경로에 붙는다 → /agentq-service/.
  // dev·preview·E2E도 같은 base로 돌린다. 배포본과 다른 모양을 테스트하면
  // base 관련 결함은 라이브에서만 드러난다.
  base: '/agentq-service/',
  plugins: [react(), tailwindcss()],
  resolve: {
    // 영역 간 참조를 눈에 보이게 한다 — 상대경로 ../../../ 는 의존 방향을 숨긴다
    alias: {
      '@app': path.resolve(import.meta.dirname, 'src/app'),
      '@pages': path.resolve(import.meta.dirname, 'src/pages'),
      '@widgets': path.resolve(import.meta.dirname, 'src/widgets'),
      '@features': path.resolve(import.meta.dirname, 'src/features'),
      '@entities': path.resolve(import.meta.dirname, 'src/entities'),
      '@shared': path.resolve(import.meta.dirname, 'src/shared'),
      '@fixtures': path.resolve(import.meta.dirname, 'src/fixtures'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // e2e는 Playwright가 담당한다 — Vitest가 집어삼키지 않게 분리
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
})
