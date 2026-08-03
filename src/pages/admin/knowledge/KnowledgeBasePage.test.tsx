import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgeBasePage } from './KnowledgeBasePage'
import { hasGap, missing, needsReindex, notSearchable } from '@entities/knowledgebase/model'
import { AREAS, INDEX_ENTRIES, RAG_CONFIG } from '@fixtures/knowledgebase'

describe('지식영역', () => {
  /* 등록 건수만 보면 다 찾을 수 있다고 믿는다 */
  it('등록 건수와 못 찾는 건수를 따로 센다', async () => {
    render(<KnowledgeBasePage />)
    // 카드 제목 옆 dd로 좁힌다 (아래 안내 문장에도 같은 숫자가 있다)
    const dt = await screen.findByText('못 찾는 문서', { selector: 'dt' })
    expect(dt.nextElementSibling).toHaveTextContent('13건')
    expect(screen.getByText(/오류가 나지 않으므로 화면이 말하지 않으면/)).toBeInTheDocument()
  })

  it('색인 뒤 바뀐 문서를 따로 센다', async () => {
    render(<KnowledgeBasePage />)
    const dt = await screen.findByText('색인 뒤 바뀐 문서', { selector: 'dt' })
    expect(dt.nextElementSibling).toHaveTextContent('17건')
  })

  it('영역마다 검색 가능 수를 등록 수와 함께 보여 준다', async () => {
    render(<KnowledgeBasePage />)
    expect(await screen.findByText(/못 찾음 6건/)).toBeInTheDocument()
  })

  it('재색인은 성공한 척하지 않는다', async () => {
    render(<KnowledgeBasePage />)
    await userEvent.click((await screen.findAllByRole('button', { name: '재색인' }))[0] as HTMLElement)
    expect(await screen.findByRole('alert')).toHaveTextContent(/못 찾는 문서는 그대로 못 찾습니다/)
  })
})

describe('못 찾는 문서', () => {
  /* '몇 건 실패'만으로는 손쓸 수 없다 */
  it('왜 못 찾는지 하나하나 적는다', async () => {
    render(<KnowledgeBasePage />)
    await userEvent.click(screen.getByRole('tab', { name: '못 찾는 문서' }))
    expect(await screen.findByText(/도면 PDF에서 글자를 뽑지 못했습니다/)).toBeInTheDocument()
    expect(screen.getByText(/한글 파일이 암호로 잠겨 있습니다/)).toBeInTheDocument()
  })

  /* 챗봇이 대피 경로를 지어낸 사건의 원인이 여기 있다 */
  it('대피도가 색인 실패로 빠져 있다', async () => {
    render(<KnowledgeBasePage />)
    await userEvent.click(screen.getByRole('tab', { name: '못 찾는 문서' }))
    expect(await screen.findByText(/비상 대피도/)).toBeInTheDocument()
  })

  it('영역을 고르면 목록이 실제로 좁혀진다', async () => {
    render(<KnowledgeBasePage />)
    await userEvent.click(screen.getByRole('tab', { name: '못 찾는 문서' }))
    expect(await screen.findByText(/13건 · 실패/)).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('지식영역'), 'k-safety')
    expect(await screen.findByText(/6건 · 실패 2건/)).toBeInTheDocument()
    expect(screen.queryByText(/부적합 보고 2026-07 묶음/)).not.toBeInTheDocument()
  })

  /* 고쳐야 할 것과 그냥 둬도 되는 것이 섞이면 안 된다 */
  it('제외와 실패를 가른다고 말한다', async () => {
    render(<KnowledgeBasePage />)
    await userEvent.click(screen.getByRole('tab', { name: '못 찾는 문서' }))
    expect(await screen.findByText(/'제외'는 일부러 뺀 것이고 '실패'는 넣으려다 못 넣은 것입니다/)).toBeInTheDocument()
  })
})

describe('RAG 설정', () => {
  /* 오류가 안 나기 때문에 화면이 말하지 않으면 아무도 모른다 */
  it('재색인이 안 끝난 상태를 경고한다', async () => {
    render(<KnowledgeBasePage />)
    await userEvent.click(screen.getByRole('tab', { name: 'RAG 설정' }))
    expect(await screen.findByText(/검색 품질이 조용히 나빠집니다/)).toBeInTheDocument()
    expect(screen.getByText(/84%/)).toBeInTheDocument()
  })

  it('설정을 바꾸면 전체 재색인이 필요하다고 말한다', async () => {
    render(<KnowledgeBasePage />)
    await userEvent.click(screen.getByRole('tab', { name: 'RAG 설정' }))
    expect(await screen.findByText(/전체를 다시 색인해야 합니다/)).toBeInTheDocument()
  })
})

describe('계산', () => {
  it('못 찾는 문서 수는 등록에서 검색 가능을 뺀 값이다', () => {
    const safety = AREAS.find((a) => a.id === 'k-safety')
    expect(missing(safety as NonNullable<typeof safety>)).toBe(6)
  })

  it('빈틈이 없는 영역은 잡지 않는다', () => {
    const clean = AREAS.find((a) => a.id === 'k-reg')
    expect(hasGap(clean as NonNullable<typeof clean>)).toBe(false)
  })

  /* 색인된 문서는 '못 찾는 문서' 목록에 없어야 한다 */
  it('색인된 것을 못 찾는 목록에 넣지 않는다', () => {
    expect(notSearchable(INDEX_ENTRIES).every((e) => e.state !== 'indexed')).toBe(true)
  })

  it('재색인이 100%가 아니면 경고 대상이다', () => {
    expect(needsReindex(RAG_CONFIG)).toBe(true)
    expect(needsReindex({ ...RAG_CONFIG, reindexedRatio: 1 })).toBe(false)
  })
})
