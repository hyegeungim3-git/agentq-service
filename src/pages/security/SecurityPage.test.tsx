import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SecurityPage } from './SecurityPage'

describe('SecurityPage', () => {
  /* 설정 화면처럼 보이면 다 정해진 줄 안다 */
  it('아직 정해지지 않은 항목 수를 먼저 말한다', () => {
    render(<SecurityPage />)
    expect(screen.getByText(/\d+개 항목이 아직 정해지지 않았습니다/)).toBeInTheDocument()
    expect(screen.getByText(/보안 설정을 바꾸는 화면이 아닙니다/)).toBeInTheDocument()
  })

  it('확정된 사실과 미정 항목을 글자로 구분한다', () => {
    render(<SecurityPage />)
    expect(screen.getAllByText('확정').length).toBeGreaterThan(0)
    expect(screen.getAllByText('미정').length).toBeGreaterThan(0)
  })

  /* 여기 적힌 문장은 코드에 근거가 있어야 한다 */
  it('지금 사실인 것을 적는다 — 서버 미연결·업로드 미전송', () => {
    render(<SecurityPage />)
    expect(screen.getByText('이 브라우저 안')).toBeInTheDocument()
    expect(screen.getByText('전송되지 않음')).toBeInTheDocument()
    expect(screen.getAllByText('이 브라우저에 저장')).toHaveLength(2)
  })
})
