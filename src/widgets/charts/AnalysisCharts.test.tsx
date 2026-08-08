import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DistributionChart, TrendChart } from './AnalysisCharts'

/**
 * **축이 거짓말하지 않는지.**
 *
 * 직접 그리기 시작했을 때 최대값을 그냥 4로 나눴다. 눈금이 0.15·0.45가 되고 글자는
 * 소수 한 자리로 반올림돼 **0.2·0.5로 적혔다** — 격자선과 숫자가 어긋난 축이었다.
 * 스크린샷을 눈으로 보고서야 잡았으므로, 여기서 숫자로 잡을 수 있게 남긴다.
 *
 * 눈금 글자를 도로 숫자로 읽어 **간격이 일정한지**를 본다. 반올림으로 어긋나면
 * 간격이 깨지므로 이 하나로 그 결함이 걸린다.
 */

/** 화면에 적힌 눈금 글자를 숫자로 되읽는다 — 단위는 떼고 본다 */
function axisTicks(root: HTMLElement): number[] {
  const axis = root.querySelector('[data-axis="y"]')
  if (!axis) return []
  return Array.from(axis.querySelectorAll('span'))
    .map((el) => Number((el.textContent ?? '').replace(/[^\d.-]/g, '')))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)
}

function gapsAreEqual(values: number[]): boolean {
  const gaps = values.slice(1).map((v, i) => v - (values[i] ?? 0))
  const first = gaps[0] ?? 0
  /* 부동소수 오차만 허용한다 */
  return gaps.every((g) => Math.abs(g - first) < 1e-9)
}

describe('분석 차트', () => {
  it('추이 — 눈금 글자와 실제 눈금이 어긋나지 않는다', () => {
    const { container } = render(
      <TrendChart
        data={[
          { period: '2025.10', value: 0.62, limit: 0.5 },
          { period: '2025.11', value: 0.58, limit: 0.5 },
          { period: '2025.12', value: 0.43, limit: 0.5 },
        ]}
        unit="%"
      />,
    )

    const ticks = axisTicks(container)
    expect(ticks.length, '눈금을 못 찾았다면 이 검사는 아무것도 보지 않았다').toBe(5)
    expect(gapsAreEqual(ticks), `눈금 간격이 어긋난다: ${ticks.join(', ')}`).toBe(true)
    /* 꼭대기가 최대값보다 낮으면 점이 축 밖으로 나가 잘린다 */
    expect(Math.max(...ticks), '꼭대기에 여유가 없으면 맨 위 점이 잘린다').toBeGreaterThanOrEqual(0.62)
  })

  it('추이 — 관리 기준을 넘은 점을 색으로 구분한다', () => {
    const { container } = render(
      <TrendChart
        data={[
          { period: '1월', value: 0.62, limit: 0.5 },
          { period: '2월', value: 0.43, limit: 0.5 },
        ]}
        unit="%"
      />,
    )
    expect(container.querySelectorAll('.bg-rose-600')).toHaveLength(1)
  })

  it('분포 — 막대가 값의 수만큼 그려지고 눈금이 고르다', () => {
    const { container } = render(
      <DistributionChart
        data={[
          { label: '치수 불량', count: 146 },
          { label: '표면 결함', count: 93 },
          { label: '기타', count: 9 },
        ]}
      />,
    )

    /* 막대는 높이를 style로 준다 — 그 개수가 데이터 수와 같아야 한다 */
    expect(container.querySelectorAll('div[title][style]')).toHaveLength(3)

    const ticks = axisTicks(container)
    expect(gapsAreEqual(ticks), `눈금 간격이 어긋난다: ${ticks.join(', ')}`).toBe(true)
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(146)
  })

  /* 차트는 데이터를 지고 있지 않다 — 같은 수치를 표가 함께 낸다. 그래서 숨긴다 */
  it('차트는 낭독기에서 감춘다 — 같은 수치를 표가 낸다', () => {
    const { container } = render(
      <DistributionChart data={[{ label: '치수 불량', count: 146 }]} />,
    )
    expect(container.querySelector('figure')).toHaveAttribute('aria-hidden', 'true')
  })

  it('값이 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<TrendChart data={[]} unit="%" />)
    expect(container).toBeEmptyDOMElement()
  })
})
