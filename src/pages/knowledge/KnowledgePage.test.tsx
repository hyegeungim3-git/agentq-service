import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgePage } from './KnowledgePage'
import * as api from '@shared/api/knowledge'

const setup = () => render(<KnowledgePage apiOptions={{ delayMs: 0 }} />)

describe('KnowledgePage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* 유사도 점수만 보여 주면 담당자가 신뢰할 근거가 없다 */
  it('유사도의 근거로 속성 일치/불일치를 함께 보여준다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '유사 도면 검색' }))
    const r = await screen.findByRole('region', { name: /유사 도면/ })
    expect(r).toHaveTextContent('HBM-2211')
    expect(r).toHaveTextContent('홀 피치')
    expect(r).toHaveTextContent('확인 필요 · 홀 피치')
  })

  it('최소 유사도를 올리면 후보가 줄어든다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '유사 도면 검색' }))
    expect(await screen.findByRole('region', { name: '유사 도면 3건' })).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('최소 유사도'), '0.9')
    await userEvent.click(screen.getByRole('button', { name: '유사 도면 검색' }))
    expect(await screen.findByRole('region', { name: '유사 도면 1건' })).toBeInTheDocument()
  })

  it('결과가 없으면 기준을 낮추라고 안내한다', async () => {
    // 빈 결과는 fixture로 만들 수 없으므로 API를 갈아끼워 확인한다.
    // 빈 화면을 그냥 두면 사용자는 '고장'으로 읽는다.
    vi.spyOn(api, 'searchDrawings').mockResolvedValue({
      ok: true,
      data: { documentId: 'doc-press-sop', indexedCount: 12_400, hits: [], elapsedSeconds: 1.2 },
    })
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '유사 도면 검색' }))
    expect(await screen.findByText(/기준을 낮춰 다시 검색/)).toBeInTheDocument()
  })
})
