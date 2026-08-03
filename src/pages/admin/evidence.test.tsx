import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiActPage } from './compliance/AiActPage'
import { ToolDeployPage } from './packops/ToolDeployPage'
import { VolumePage } from './mlops/VolumePage'
import {
  browserOnly,
  externalServers,
  nearlyFull,
  noRecord,
  provableRatio,
  stale,
  usedRatio,
} from '@entities/evidence/model'
import { EVIDENCE, MCP_SERVERS, VOLUMES } from '@fixtures/evidence'
import { TOOLS } from '@fixtures/packops'
import { DUTIES } from '@entities/compliance/model'

describe('감사 추적 (AI 기본법 4번째 탭)', () => {
  /* '이행했다'와 '이행을 증명할 수 있다'는 다르다 */
  it('증명할 수 있는 것과 이행했다는 것을 가른다', async () => {
    render(<AiActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '감사 추적' }))
    expect(await screen.findByText(/지금 서버 기록으로 증명할 수 있는 책무 · 1 \/ 5/)).toBeInTheDocument()
    expect(screen.getByText(/지켰다고 증명할 수 있는 것/)).toBeInTheDocument()
  })

  it('아무 데도 안 남는 항목을 먼저 말한다', async () => {
    render(<AiActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '감사 추적' }))
    expect(await screen.findByText(/아무 데도 기록이 남지 않는 항목 3건/)).toBeInTheDocument()
    expect(screen.getByText(/지금 감사를 받으면 이 항목들은 근거로 내놓을 것이 없습니다/)).toBeInTheDocument()
  })

  /* 그 사람이 브라우저를 지우면 사라진다 */
  it('브라우저에만 남는 것이 기관 기록이 아님을 밝힌다', async () => {
    render(<AiActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '감사 추적' }))
    expect(await screen.findByText(/기관 차원의 기록이\s*아닙니다/)).toBeInTheDocument()
  })

  it('서버가 붙으면 숫자가 올라간다고 말한다', async () => {
    render(<AiActPage />)
    await userEvent.click(screen.getByRole('tab', { name: '감사 추적' }))
    expect(await screen.findByText(/'남지 않음'이 '서버 기록'으로\s*바뀝니다/)).toBeInTheDocument()
  })

  it('책무 다섯 가지를 모두 다룬다', () => {
    expect(EVIDENCE).toHaveLength(DUTIES.length)
    for (const d of DUTIES) {
      expect(
        EVIDENCE.some((e) => e.duty === d),
        d,
      ).toBe(true)
    }
  })
})

describe('MCP 서버 (도구·배포 탭)', () => {
  /* 인프라 주소를 지어내지 않는다 */
  it('서버 주소를 표시하지 않는 이유를 적는다', async () => {
    render(<ToolDeployPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'MCP 서버' }))
    expect(await screen.findByText(/서버 주소와 접속 토큰은 이 화면에 표시하지 않습니다/)).toBeInTheDocument()
  })

  /* fixture에도 주소를 두지 않는다 — 두면 화면에 뿌리고 싶어진다 */
  it('fixture에 주소·토큰이 없다', () => {
    const raw = JSON.stringify(MCP_SERVERS)
    // 시각(09:12)이 포트로 잡히지 않게 IP·URL·프로토콜·토큰만 본다
    expect(raw).not.toMatch(/https?:\/\/|grpc|token|secret|\d+\.\d+\.\d+\.\d+/i)
  })

  it('사외로 나가는 서버를 따로 말한다', async () => {
    render(<ToolDeployPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'MCP 서버' }))
    expect(await screen.findByText(/사외로 나가는 서버가 1개/)).toBeInTheDocument()
  })

  it('끊긴 서버를 맨 위에 두고 이유를 적는다', async () => {
    render(<ToolDeployPage />)
    await userEvent.click(screen.getByRole('tab', { name: 'MCP 서버' }))
    const list = await screen.findByRole('list', { name: 'MCP 서버' })
    expect(list.children[0]?.textContent).toContain('PdM 수집기 서버')
    expect(screen.getByText(/게이트웨이가 응답하지 않습니다/)).toBeInTheDocument()
  })

  /* 서버가 주는 도구가 도구 목록과 같아야 한다 */
  it('서버의 도구가 도구 목록에 실제로 있다', () => {
    for (const sv of MCP_SERVERS) {
      for (const t of sv.toolIds) {
        expect(
          TOOLS.some((x) => x.id === t),
          `${sv.id}/${t}`,
        ).toBe(true)
      }
    }
  })
})

describe('공유 볼륨', () => {
  /* 오류가 나는 것은 다 찬 다음이다 */
  it('곧 찰 볼륨을 먼저 말한다', async () => {
    render(<VolumePage />)
    expect(await screen.findByText(/85%를 넘긴 볼륨 1개/)).toBeInTheDocument()
    expect(screen.getByText(/차면 학습 작업이 중간에 죽습니다/)).toBeInTheDocument()
  })

  it('오래 안 쓴 볼륨을 용량과 함께 말한다', async () => {
    render(<VolumePage />)
    expect(await screen.findByText(/60일 넘게 아무도 안 쓴 볼륨이 1개/)).toBeInTheDocument()
    expect(screen.getByText(/exp-2025-embedding 640GB/)).toBeInTheDocument()
  })

  it('비우기는 성공한 척하지 않는다', async () => {
    render(<VolumePage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '비우기' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/저장 공간은 그대로 잡혀 있습니다/)
  })
})

describe('판정', () => {
  it('기록이 없는 것과 브라우저에만 있는 것을 가른다', () => {
    expect(noRecord(EVIDENCE).map((e) => e.duty)).toEqual(['risk', 'explain', 'oversight'])
    expect(browserOnly(EVIDENCE).map((e) => e.duty)).toEqual(['protect'])
    expect(provableRatio(EVIDENCE)).toBeCloseTo(0.2, 5)
  })

  it('사외 서버를 골라낸다', () => {
    expect(externalServers(MCP_SERVERS).map((s) => s.id)).toEqual(['m-erp'])
  })

  it('곧 찰 볼륨과 오래 안 쓴 볼륨을 가른다', () => {
    expect(nearlyFull(VOLUMES).map((v) => v.id)).toEqual(['v-train'])
    expect(stale(VOLUMES).map((v) => v.id)).toEqual(['v-old'])
    expect(usedRatio(VOLUMES[0] as NonNullable<(typeof VOLUMES)[0]>)).toBeCloseTo(0.92, 2)
  })
})
