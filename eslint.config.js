import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/* 린터 선택 근거 (agent-rules §9 "기술 선택은 이유를 기록한다")
 *
 * Vite 스캐폴드 기본값은 oxlint였으나 ESLint로 교체했다. 속도가 아니라
 * '실제로 났던 결함을 잡는가'로 판단했다. 이전 프로젝트에서 난 결함 4종을
 * 그대로 재현해 두 린터를 대조한 결과:
 *
 *   결함                                        oxlint   ESLint(react-hooks v7)
 *   rules-of-hooks (조건부 훅)                    O          O
 *   static-components (렌더 중 컴포넌트 정의)      X          O
 *   purity (렌더 중 Date.now)                     X          O
 *   set-state-in-effect (연쇄 렌더)               X          O
 *
 * static-components는 입력창이 매 렌더마다 리마운트돼 '첫 글자만 입력되는'
 * 증상을 만든다. 이전 프로젝트에서 이걸 브라우저로 수동 재현해 찾았는데,
 * 이 규칙 하나면 3초에 나온다. 두 린터를 함께 두지 않은 이유는 §9의
 * '비슷한 목적의 도구 중복 도입 금지' 때문이다.
 */
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      // flat config 형태를 써야 한다 — 최상위 configs['recommended-latest']는 구형(eslintrc) 스키마다
      reactHooks.configs.flat['recommended-latest'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // 설정 파일은 Node 환경이고 타입 프로젝트 밖이다
  {
    files: ['*.config.{ts,js}', 'e2e/**/*.ts', 'scripts/**/*.{ts,js}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
)
