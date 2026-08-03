import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VectorDbPage } from './VectorDbPage'
import { IngestPage } from './IngestPage'
import { BenchmarkPage } from './BenchmarkPage'
import {
  dimensionGroups,
  failing,
  notUsable,
  onlyFarBenchmarks,
  silent,
  unattached,
} from '@entities/datainfra/model'
import { BENCHMARKS, BENCHMARK_RUNS, COLLECTIONS, INGEST_SOURCES } from '@fixtures/datainfra'
import { AREAS } from '@fixtures/knowledgebase'

describe('P5 3차 공통', () => {
  it('세 화면 모두 예시 값임을 먼저 말한다', () => {
    for (const Page of [VectorDbPage, IngestPage, BenchmarkPage]) {
      const { unmount } = render(<Page />)
      expect(screen.getAllByText(/서버 미연결 — 예시 값/).length).toBeGreaterThan(0)
      unmount()
    }
  })
})

describe('벡터 DB', () => {
  /* 목록만 보면 그냥 나란한 컬렉션으로 보인다 */
  it('차원이 다르면 섞어 쓸 수 없다고 말한다', async () => {
    render(<VectorDbPage />)
    expect(await screen.findByText(/차원이 다른 컬렉션이 섞여 있습니다 \(768 \/ 1024차원\)/)).toBeInTheDocument()
    expect(screen.getByText(/왜 이 문단이 잡혔는지 알 수 없게\s*됩니다/)).toBeInTheDocument()
  })

  it('어느 영역에도 안 붙은 컬렉션을 드러낸다', async () => {
    render(<VectorDbPage />)
    expect(await screen.findByText(/어느 지식영역에도 안 붙은 컬렉션이 1개/)).toBeInTheDocument()
    expect(screen.getByText('안 붙음')).toBeInTheDocument()
  })

  /* 0ms를 '빠르다'로 읽으면 안 된다 */
  it('아직 안 만들어진 컬렉션의 지연을 0으로 그리지 않는다', async () => {
    render(<VectorDbPage />)
    expect(await screen.findByText('아직 없음')).toBeInTheDocument()
  })

  it('컬렉션이 지식영역과 이어진다', () => {
    for (const c of COLLECTIONS) {
      if (c.areaId === null) continue
      expect(
        AREAS.some((a) => a.id === c.areaId),
        c.id,
      ).toBe(true)
    }
  })
})

describe('자동 적재', () => {
  /* 스케줄은 계속 돌고 있어 목록만 보면 정상으로 보인다 */
  it('마지막 수집이 실패한 소스를 먼저 말한다', async () => {
    render(<IngestPage />)
    expect(await screen.findByText(/마지막 수집이 실패한 소스 1건/)).toBeInTheDocument()
    expect(screen.getByText(/인증 키가 만료됐습니다\(401\)/)).toBeInTheDocument()
    expect(screen.getByText(/스케줄은 계속 돌고 있어 목록만 보면 정상으로 보입니다/)).toBeInTheDocument()
  })

  /* 성공 표시만으로는 구분되지 않는다 */
  it('성공했는데 0건인 소스를 따로 말한다', async () => {
    render(<IngestPage />)
    expect(await screen.findByText(/성공했지만 한 건도 못 가져온 소스가 1건/)).toBeInTheDocument()
  })

  it('가져온 수와 검색 가능 수가 다를 수 있다고 잇는다', async () => {
    render(<IngestPage />)
    expect(await screen.findByText(/여기서 가져온 수와 거기서\s*검색 가능한 수는 다를 수 있습니다/)).toBeInTheDocument()
  })

  it('수집 실행은 성공한 척하지 않는다', async () => {
    render(<IngestPage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '지금 수집' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/새로 들어온 문서는 없습니다/)
  })
})

describe('평가 지표', () => {
  /* 점수만 나란히 세우면 위키 독해 잘하는 모델을 사내 QA용으로 고르게 된다 */
  it('무엇을 재는 지표인지 점수보다 먼저 말한다', async () => {
    render(<BenchmarkPage />)
    expect(await screen.findByText('이 지표들이 무엇을 재는가')).toBeInTheDocument()
    expect(screen.getByText(/위키 문장 독해입니다. 사내 문서 QA를 잘한다는 근거로 쓸 수 없습니다/)).toBeInTheDocument()
  })

  it('업무와 다른 지표로만 잰 모델을 드러낸다', async () => {
    render(<BenchmarkPage />)
    expect(await screen.findByText(/업무와 다른 벤치마크로만 잰 모델 1종/)).toBeInTheDocument()
    expect(screen.getByText(/사내 문서 QA를 잘한다는 근거가 되지\s*않습니다/)).toBeInTheDocument()
  })

  /* 안 끝난 실행의 0을 점수로 그리면 최악으로 읽힌다 */
  it('실행 중인 평가를 0점으로 그리지 않는다', async () => {
    render(<BenchmarkPage />)
    expect(await screen.findByText('실행 중')).toBeInTheDocument()
  })

  it('다른 지표끼리 비교하지 말라고 적는다', async () => {
    render(<BenchmarkPage />)
    expect(await screen.findByText(/서로 다른 지표의 점수를 나란히 두고 비교하지 마십시오/)).toBeInTheDocument()
  })
})

describe('판정', () => {
  it('차원 종류를 센다', () => {
    expect(dimensionGroups(COLLECTIONS)).toEqual([768, 1024])
  })

  it('지금 못 쓰는 컬렉션과 안 붙은 컬렉션을 가른다', () => {
    expect(notUsable(COLLECTIONS).map((c) => c.id)).toEqual(['c-safety', 'c-equip', 'c-old'])
    expect(unattached(COLLECTIONS).map((c) => c.id)).toEqual(['c-old'])
  })

  /* 실패와 '성공했는데 0건'은 다른 문제다 */
  it('실패한 소스와 조용한 소스를 가른다', () => {
    expect(failing(INGEST_SOURCES).map((s) => s.id)).toEqual(['i-law'])
    expect(silent(INGEST_SOURCES).map((s) => s.id)).toEqual(['i-safety'])
  })

  it('업무와 다른 지표로만 잰 모델을 잡는다', () => {
    expect(onlyFarBenchmarks(BENCHMARK_RUNS, BENCHMARKS, 'EXAONE-3.0-7.8B')).toBe(true)
    expect(onlyFarBenchmarks(BENCHMARK_RUNS, BENCHMARKS, 'GPT-OSS-120B')).toBe(false)
  })

  it('잰 적 없는 모델은 잡지 않는다', () => {
    expect(onlyFarBenchmarks(BENCHMARK_RUNS, BENCHMARKS, '없는모델')).toBe(false)
  })
})
