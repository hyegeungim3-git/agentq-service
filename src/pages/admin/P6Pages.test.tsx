import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecurityArchPage } from './sysops/SecurityArchPage'
import { AugmentPage } from './knowledge/AugmentPage'
import { CatalogPage } from './datainfra/CatalogPage'
import { PredOpsPage } from './mlops/PredOpsPage'
import { crossing, expired, policyViolations, withoutMfa } from '@entities/secarch/model'
import { BOUNDARY_RULES, DATA_FLOWS, EXTERNAL_ACCESS } from '@fixtures/secarch'
import { disabled, fallbackFor, shareTotal, staleCache } from '@entities/augment/model'
import { CACHE_ENTRIES, ROUTES, STRATEGIES } from '@fixtures/augment'
import { riskyForAggregate, withoutLineage } from '@entities/catalog/model'
import { DATA_ASSETS, LINEAGES } from '@fixtures/catalog'
import {
  awaitingPromotion,
  challengerWins,
  margin,
  needsAttention,
  withoutSchedule,
} from '@entities/predops/model'
import { PRED_MODELS, RETRAIN_RUNS } from '@fixtures/predops'
import { TODAY } from '@fixtures/users'

describe('보안 아키텍처', () => {
  /**
   * 정책 표가 '막고 있다'는 증거가 아니다.
   *
   * 표에 '차단'이라 적혀 있다는 이유로 막히고 있다고 믿게 되면 이 화면은 없느니만 못하다.
   */
  it('정책 표가 실제 통제가 아니라고 밝힌다', async () => {
    render(<SecurityArchPage />)
    expect(await screen.findByText(/이 표는 정책이지 실제 통제가 아닙니다/)).toBeInTheDocument()
    expect(screen.getByText(/게이트웨이가 답해야 합니다/)).toBeInTheDocument()
  })

  /* 사람이 두 표를 손으로 대조하지 않는다 — 화면이 찾아 준다 */
  it('막기로 한 등급이 실제로 넘고 있으면 찾아낸다', async () => {
    render(<SecurityArchPage />)
    expect(await screen.findByText(/막기로 한 등급이 실제로 경계를 넘고 있습니다 1건/)).toBeInTheDocument()
    expect(screen.getByText(/작업표준 번역 의뢰\(수출 대응\) — 대외비 등급이/)).toBeInTheDocument()
    expect(screen.getByText(/설명되지 않은 통과/)).toBeInTheDocument()
  })

  it('기간이 지난 외부 접근과 2단계 인증 없는 접근을 따로 말한다', async () => {
    render(<SecurityArchPage />)
    expect(await screen.findByText(/기간이 지난 접근/)).toBeInTheDocument()
    expect(screen.getByText(/협력사 명진테크\(2026-06-30\)/)).toBeInTheDocument()
    expect(screen.getByText(/2단계 인증 없이 살아 있는 외부 접근/)).toBeInTheDocument()
    /* 목록에 있다고 계정이 닫힌 것은 아니다 */
    expect(screen.getByText(/닫혔는지는 서버가 답해야 합니다/)).toBeInTheDocument()
  })

  it('경계를 넘는 흐름만 센다', () => {
    expect(crossing(DATA_FLOWS).map((f) => f.id)).toEqual(['df-3', 'df-4', 'df-5'])
  })

  it('정책이 차단인 등급만 위반으로 잡는다', () => {
    /* df-3·df-4는 공개 등급이라 경계를 넘어도 정책에 맞는다 */
    expect(policyViolations(DATA_FLOWS, BOUNDARY_RULES).map((f) => f.id)).toEqual(['df-5'])
  })

  it('만료는 기준 시점으로 판정한다', () => {
    expect(expired(EXTERNAL_ACCESS, TODAY).map((a) => a.id)).toEqual(['ex-4'])
    expect(withoutMfa(EXTERNAL_ACCESS).map((a) => a.id)).toEqual(['ex-3'])
  })
})

describe('지식 증강 전략', () => {
  /**
   * 규칙이 목록에 있으면 도는 줄 안다.
   *
   * 꺼져 있으면 그 질의가 **어디로 흘러가는지**까지 말해야 한다.
   */
  it('꺼진 규칙의 질의가 어디로 가는지 말한다', async () => {
    render(<AugmentPage />)
    expect(await screen.findByText(/1순위 규칙이 꺼져 있습니다/)).toBeInTheDocument()
    expect(screen.getByText(/2순위\(CAG\)로 갑니다/)).toBeInTheDocument()
    expect(screen.getByText(/수치가 틀립니다/)).toBeInTheDocument()
  })

  /* 캐시는 검색 없이 바로 답한다 — 낡으면 옛 내용을 자신 있게 말한다 */
  it('원문이 바뀐 캐시를 버전 두 개로 보여 준다', async () => {
    render(<AugmentPage />)
    expect(await screen.findByText(/원문이 바뀌었는데 다시 안 올린 캐시 1건/)).toBeInTheDocument()
    expect(screen.getByText(/올릴 때 v6 \(2026-06-19\), 지금 v7 \(2026-07-25\)/)).toBeInTheDocument()
  })

  /* 강점만 적으면 셋 다 좋아 보여 고를 수 없다 */
  it('방법마다 못 하는 것을 함께 적는다', async () => {
    render(<AugmentPage />)
    expect(await screen.findByText(/못 하는 것 — 검색에 시간이 걸리고/)).toBeInTheDocument()
    expect(screen.getByText(/못 하는 것 — 올릴 수 있는 양에 한계가 있고/)).toBeInTheDocument()
  })

  it('다시 올리기는 성공한 척하지 않는다', async () => {
    render(<AugmentPage />)
    const buttons = await screen.findAllByRole('button', { name: '다시 올리기' })
    await userEvent.click(buttons[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/서버가 원문을 읽어 캐시를 교체해야 합니다/)
  })

  it('꺼진 규칙과 그 다음 규칙을 계산한다', () => {
    const off = disabled(ROUTES)
    expect(off.map((r) => r.id)).toEqual(['rt-1'])
    expect(fallbackFor(ROUTES, off[0] as NonNullable<(typeof off)[0]>)?.id).toBe('rt-2')
  })

  it('낡은 캐시는 두 버전이 다른 것만 잡는다', () => {
    expect(staleCache(CACHE_ENTRIES).map((c) => c.id)).toEqual(['cc-3'])
    expect(shareTotal(STRATEGIES)).toBe(100)
  })
})

describe('카탈로그 · 리니지', () => {
  /* 같은 74%라도 쓰임에 따라 위험이 다르다 */
  it('집계에 쓰이면서 표준화가 낮은 자산을 먼저 말한다', async () => {
    render(<CatalogPage />)
    expect(await screen.findByText(/수치 집계에 쓰이는데 표준화가 90% 아래인 자산 1개/)).toBeInTheDocument()
    expect(screen.getByText(/품질 집계 테이블 — 표준화 74%/)).toBeInTheDocument()
    expect(screen.getByText(/집계는 틀린 수치를 그대로 답합니다/)).toBeInTheDocument()
  })

  it('계보가 없는 자산을 채워 넣지 않고 없다고 말한다', async () => {
    render(<CatalogPage />)
    expect(await screen.findByText(/계보가 아직 안 그려진 자산/)).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: '계보 보기' })[3] as HTMLElement)
    expect(await screen.findByText(/계보가 아직 정의되지 않았습니다/)).toBeInTheDocument()
    expect(screen.getByText(/그럴듯하게 그려 두면 아무도 안 고칩니다/)).toBeInTheDocument()
  })

  it('계보를 펴면 원천·처리·소비처가 나온다', async () => {
    render(<CatalogPage />)
    const buttons = await screen.findAllByRole('button', { name: '계보 보기' })
    await userEvent.click(buttons[1] as HTMLElement)
    expect(await screen.findByText('MES 생산 원장')).toBeInTheDocument()
    expect(screen.getByText(/불량 코드·단위 표준 매핑/)).toBeInTheDocument()
  })

  it('집계 쓰임만 표준화 기준으로 잡는다', () => {
    /* as-3은 표준화 45%지만 문서 인식이라 집계 위험이 아니다 */
    expect(riskyForAggregate(DATA_ASSETS).map((a) => a.id)).toEqual(['as-2'])
    expect(withoutLineage(DATA_ASSETS, LINEAGES).map((a) => a.id)).toEqual(['as-4'])
  })
})

describe('예측 모델 운영', () => {
  /**
   * MAE는 낮을수록 좋고 F1은 높을수록 좋다.
   *
   * 두 수를 나란히 세우면 반드시 잘못 읽는다. 여유로 바꿔 방향을 없앤다.
   */
  it('지표 방향이 달라도 같은 방식으로 읽히게 여유로 말한다', async () => {
    render(<PredOpsPage />)
    expect(await screen.findByText(/남은 여유/)).toBeInTheDocument()
    expect(screen.getByText(/\(낮을수록 좋음\)/)).toBeInTheDocument()
    expect(screen.getByText(/\(높을수록 좋음\)/)).toBeInTheDocument()
  })

  it('손봐야 하는데 일정이 없는 모델을 드러낸다', async () => {
    render(<PredOpsPage />)
    expect(await screen.findByText(/다음 재학습이 안 잡힌 모델/)).toBeInTheDocument()
    expect(screen.getByText(/언제 손볼지가 없습니다/)).toBeInTheDocument()
  })

  it('새 모델이 더 나은데 안 바꾼 것을 말한다', async () => {
    render(<PredOpsPage />)
    expect(await screen.findByText(/새로 만든 쪽이 더 나은데 아직 안 바꾼 것/)).toBeInTheDocument()
    expect(screen.getByText(/옛 모델의 답을 받습니다/)).toBeInTheDocument()
  })

  it('교체는 성공한 척하지 않는다', async () => {
    render(<PredOpsPage />)
    await userEvent.click(await screen.findByRole('button', { name: '이 모델로 교체' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/서비스 중인 모델을 바꾸는 일이라/)
  })
})

describe('여유 계산', () => {
  it('방향에 맞게 남은 만큼을 돌려준다', () => {
    const lower = PRED_MODELS.find((m) => m.id === 'pm-1')
    const higher = PRED_MODELS.find((m) => m.id === 'pm-2')
    /* MAE 8.4 → 9.1, 선은 11.0 — 2.6/2.6 만큼 남았다 */
    expect(margin(lower as NonNullable<typeof lower>)).toBeCloseTo(0.73, 2)
    /* F1 0.91 → 0.86, 선은 0.85 — 0.01/0.06만 남았다 */
    expect(margin(higher as NonNullable<typeof higher>)).toBeCloseTo(0.17, 2)
  })

  it('여유가 얼마 없는 것만 잡는다', () => {
    expect(needsAttention(PRED_MODELS).map((m) => m.id)).toEqual(['pm-2'])
    expect(withoutSchedule(PRED_MODELS).map((m) => m.id)).toEqual(['pm-2'])
  })

  it('승패도 방향을 흡수한다', () => {
    const higher = RETRAIN_RUNS.find((r) => r.id === 'rr-1')
    const lower = RETRAIN_RUNS.find((r) => r.id === 'rr-2')
    expect(challengerWins(higher as NonNullable<typeof higher>)).toBe(true)
    /* MAE 8.9 → 8.4는 줄었으므로 이긴 것이다 */
    expect(challengerWins(lower as NonNullable<typeof lower>)).toBe(true)
    expect(awaitingPromotion(RETRAIN_RUNS).map((r) => r.id)).toEqual(['rr-1'])
  })
})
