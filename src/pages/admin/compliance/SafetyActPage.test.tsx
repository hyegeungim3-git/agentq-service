import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SafetyActPage } from './SafetyActPage'
import {
  actionable,
  daysBetween,
  incompleteTraining,
  metRatio,
  openActions,
  staleEvidence,
} from '@entities/safetyact/model'
import { RISK_ASSESSMENTS, SAFETY_DUTIES, SAFETY_TRAININGS } from '@fixtures/safetyact'
import { TODAY } from '@fixtures/users'

describe('중대재해처벌법 대응', () => {
  /* 화면이 판정하는 것처럼 보이면 의무를 화면에 넘기게 된다 — AI 기본법 대응과 같은 규율 */
  it('법적 판단을 내리지 않는다고 먼저 말한다', () => {
    render(<SafetyActPage />)
    expect(screen.getByText(/이 화면은 법적 판단을 내리지 않습니다/)).toBeInTheDocument()
  })

  it('근거 조문을 함께 보여 준다', () => {
    render(<SafetyActPage />)
    expect(screen.getByText(/시행령 제4조/)).toBeInTheDocument()
  })

  /**
   * 이 화면의 핵심.
   *
   * 한 번 '이행'으로 적으면 표는 영원히 초록색이다. 조치 필요는 이미 드러나 있고,
   * 표만 봐서는 안 보이는 것이 **초록색인데 낡은 증빙**이다.
   */
  it("'이행'인데 갱신 주기를 넘긴 호를 표 위에서 이름으로 말한다", async () => {
    render(<SafetyActPage />)
    expect(await screen.findByText(/정한 갱신 주기를 넘긴 호 1건/)).toBeInTheDocument()
    expect(screen.getByText(/제6호 안전보건 전문인력 배치 — 2025-11-14 이후/)).toBeInTheDocument()
  })

  /* 연 1회짜리를 반년 기준으로 재면 정상인 것이 빨간색이 되고, 그러면 경고를 안 본다 */
  it('주기가 호마다 다르다 — 1월 공표한 연 1회 문서는 안 잡는다', () => {
    expect(staleEvidence(SAFETY_DUTIES, TODAY).map((d) => d.id)).not.toContain('sd-1')
    expect(daysBetween('2026-01-05', TODAY)).toBeGreaterThan(180)
  })

  it('낡은 증빙의 경과 일수를 기준 시점으로 센다', async () => {
    render(<SafetyActPage />)
    /* 브라우저 시계가 아니라 데이터를 준 쪽의 기준 날짜(2026-08-02)로 센다 */
    const days = daysBetween('2025-11-14', TODAY)
    expect(await screen.findByText(new RegExp(`${days}일째\\s*갱신 없음`))).toBeInTheDocument()
  })

  it('조치가 필요한 호를 이름으로 말한다', async () => {
    render(<SafetyActPage />)
    expect(await screen.findByText(/조치가 필요한 호/)).toBeInTheDocument()
    expect(screen.getByText(/제5호 안전보건관리책임자 권한·평가 · 제9호/)).toBeInTheDocument()
  })

  it('탭이 내용을 실제로 바꾼다', async () => {
    render(<SafetyActPage />)
    expect(await screen.findByText('안전보건 목표·경영방침 설정')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: '위험성평가 이력' }))
    expect(await screen.findByText('침탄로 상부 고소 작업')).toBeInTheDocument()
    expect(screen.queryByText('안전보건 목표·경영방침 설정')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: '교육·점검' }))
    expect(await screen.findByText('수급업체 작업 전 안전교육')).toBeInTheDocument()
  })

  /* 평가를 했다는 것과 위험이 없어진 것은 다르다 */
  it('위험성평가는 조치가 남은 건수를 말한다', async () => {
    render(<SafetyActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '위험성평가 이력' }))
    expect(await screen.findByText(/조치가 남은 평가 2건/)).toBeInTheDocument()
    /* 고소 작업 4중 3, 야간 반입 2중 1 — 둘 다 1건씩 남았다 */
    expect(screen.getAllByText('조치 1건 남음')).toHaveLength(2)
    expect(screen.getByText('조치 완료')).toBeInTheDocument()
  })

  /* 이수율만 보면 끝난 것처럼 보인다 */
  it('교육은 남은 인원을 사람 수로 말한다', async () => {
    render(<SafetyActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '교육·점검' }))
    expect(await screen.findByText('8명 미이수')).toBeInTheDocument()
    expect(screen.getByText('3명 미이수')).toBeInTheDocument()
  })
})

describe('이행 판정', () => {
  it("'이행'인 것 중 제 주기를 넘긴 증빙만 잡는다", () => {
    expect(staleEvidence(SAFETY_DUTIES, TODAY).map((d) => d.id)).toEqual(['sd-6'])
  })

  /* 주의·미이행은 이미 드러나 있다 — 낡음 판정에 섞으면 같은 것을 두 번 센다 */
  it('주의인 호는 주기를 넘겨도 낡음으로 세지 않는다', () => {
    const attention = SAFETY_DUTIES.find((d) => d.id === 'sd-5')
    expect(attention?.evidenceAt).toBe('2025-12-20')
    expect(staleEvidence(SAFETY_DUTIES, TODAY).map((d) => d.id)).not.toContain('sd-5')
    expect(actionable(SAFETY_DUTIES).map((d) => d.id)).toEqual(['sd-5', 'sd-9'])
  })

  it('이행 비율은 이행으로 적힌 것만 센다', () => {
    expect(metRatio(SAFETY_DUTIES)).toBe(78)
  })

  it('조치가 남은 평가만 잡는다', () => {
    expect(openActions(RISK_ASSESSMENTS).map((r) => r.id)).toEqual(['ra-2', 'ra-3'])
  })

  it('전원 이수한 교육은 안 잡는다', () => {
    expect(incompleteTraining(SAFETY_TRAININGS).map((t) => t.id)).toEqual(['st-1', 'st-3'])
  })
})
