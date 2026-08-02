import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataQueryPage } from './DataQueryPage'

const setup = () => render(<DataQueryPage apiOptions={{ delayMs: 0 }} />)

describe('DataQueryPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* 말없이 가정하면 담당자가 틀린 수치를 맞다고 믿는다 */
  it('AI가 가정한 조건을 드러낸다', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: '조회 실행' }))
    const basis = await screen.findByRole('region', { name: '질의 해석 근거' })
    expect(basis).toHaveTextContent('질의에 없어 AI가 가정한 조건')
    expect(basis).toHaveTextContent('내용연수 12년')
  })

  it('변환하지 못한 표현을 밝힌다', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: '조회 실행' }))
    const basis = await screen.findByRole('region', { name: '질의 해석 근거' })
    expect(basis).toHaveTextContent('변환하지 못한 표현')
  })

  it('질의 조각을 컬럼·조건으로 대조해 보여준다', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: '조회 실행' }))
    const basis = await screen.findByRole('region', { name: '질의 해석 근거' })
    expect(basis).toHaveTextContent('install_year')
  })

  it('소스를 바꾸면 예시 질의와 결과가 함께 바뀐다', async () => {
    setup()
    await userEvent.click(screen.getByRole('radio', { name: '자재 재고' }))
    expect(screen.getByLabelText(/무엇을 조회할까요/)).toHaveValue('SUS 자재 재고 부족한 순으로 보여줘')

    await userEvent.click(screen.getByRole('button', { name: '조회 실행' }))
    expect(await screen.findByRole('region', { name: /자재 재고/ })).toHaveTextContent('SUS304-2211')
  })

  it('질의가 비면 실행할 수 없다', async () => {
    setup()
    await userEvent.clear(screen.getByLabelText(/무엇을 조회할까요/))
    expect(screen.getByRole('button', { name: '조회 실행' })).toBeDisabled()
  })
})
