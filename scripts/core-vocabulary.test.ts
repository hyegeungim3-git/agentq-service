import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * **코어에 특정 업종의 말이 박혀 있지 않은지.**
 *
 * 팩 검사(`src/fixtures/packs.test.ts`)는 팩 데이터를 본다. 그런데 실제 사고는
 * 세 번 다 **코어에 박힌 문자열**에서 났다.
 *
 *  ① 에이전트 카탈로그 이름 — 병원 허브에 `수출 문서 번역`
 *  ② 에이전트 정의 단계 — 병원 카드에 `MES 조회`·`설비 상태 조회`
 *  ③ 화면 문구·라벨 — 병원 챗봇에 `사내 규정·작업표준을 근거로`,
 *     FAQ 범주에 `작업표준`, 회의록 첨부 목록에 `프레스_작업표준서`
 *
 * ③을 못 잡은 이유가 분명하다. 경계 함수만 훑었기 때문이다 —
 * **하드코딩된 문자열은 경계를 안 지난다.** 그래서 소스를 직접 읽는다.
 *
 * 여기서 보는 것은 `entities`·`features`·`pages`·`widgets`다.
 * `fixtures/`는 발주처 데이터가 사는 곳이라 제외한다.
 */

const ROOT = process.cwd()

/** 한 업종에서만 쓰는 말 — 코어에 있으면 다른 발주처 화면에 그대로 뜬다 */
const INDUSTRY_WORDS = [
  /* 제조 */ '프레스',
  '금형',
  '침탄',
  '작업표준',
  '설비 태그',
  '수입검사',
  'MES',
  'PdM',
  '한빛정밀',
  /* 공공·행정 */ '공시지가',
  '표준지',
  '옥외광고',
  '한성시',
  /* 의료 */ '요양급여',
  '병상',
  '새빛',
]

const DIRS = ['src/entities', 'src/features', 'src/pages', 'src/widgets']

/**
 * 알면서 남겨 둔 곳.
 *
 * 복합 업무 릴레이는 아직 제조 이야기 하나로 고정돼 있다. 다른 발주처에는
 * 릴레이 카드 자체를 안 그리므로 화면에 나가지는 않는다 — 발주처별 릴레이를
 * 만들면 이 줄이 사라진다. **예외를 여기 적어 두는 것이 기록이다.**
 */
const KNOWN = ['src/features/orchestration/useOrchestration.ts']

function sources(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      out.push(...sources(p))
      continue
    }
    if (!/\.tsx?$/.test(name)) continue
    /* 테스트는 값을 주입해 확인하는 곳이라 업종 말이 나올 수 있다 */
    if (/\.test\.tsx?$/.test(name)) continue
    out.push(p)
  }
  return out
}

/**
 * 주석은 뺀다 — **왜 이렇게 만들었는지**를 적은 곳이라 사고 사례가 그대로 들어 있다.
 * 화면에 안 나가는 글자를 잡으면 검사가 '늑대야'를 외치고, 그러면 사람이 검사를 끈다.
 */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

describe('코어 어휘', () => {
  it('화면·훅·모델에 한 업종의 말이 박혀 있지 않다', () => {
    const hits: string[] = []
    for (const dir of DIRS) {
      for (const file of sources(join(ROOT, dir))) {
        const rel = file.slice(ROOT.length + 1).split('\\').join('/')
        if (KNOWN.includes(rel)) continue
        const code = stripComments(readFileSync(file, 'utf8'))
        for (const w of INDUSTRY_WORDS) {
          /* 영문 약어는 낱말 경계로 본다 — 'MES'가 'THEMES'에 걸려 오탐이 났다 */
          const re = /^[A-Za-z]+$/.test(w) ? new RegExp(`\\b${w}\\b`) : null
          if (re ? re.test(code) : code.includes(w)) hits.push(`${rel}: '${w}'`)
        }
      }
    }
    expect(hits, '코어에 업종 말이 있으면 다른 발주처 화면에 그대로 뜬다').toEqual([])
  })
})
