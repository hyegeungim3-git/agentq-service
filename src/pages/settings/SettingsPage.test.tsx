import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { SettingsPage } from './SettingsPage'
import { usePrefs, DEFAULT_PREFS } from '@features/prefs/usePrefs'

/** 훅과 화면을 함께 돌린다 — 고른 것이 실제로 적용되는지 봐야 한다 */
function Harness() {
  const store = usePrefs()
  return <SettingsPage store={store} />
}

/** 다시 마운트해 저장된 값이 살아 있는지 본다 */
function Remount() {
  const [n, setN] = useState(0)
  return (
    <>
      <button type="button" onClick={() => setN(n + 1)}>
        다시 열기
      </button>
      <Harness key={n} />
    </>
  )
}

describe('환경설정', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset['theme']
  })

  it('어둡게를 고르면 문서 루트가 바뀐다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(document.documentElement.dataset['theme']).toBe('light')

    await user.click(screen.getByRole('radio', { name: '어둡게' }))
    /* 팔레트 변수가 이 속성을 보고 뒤집힌다 — 여기가 안 바뀌면 색도 안 바뀐다 */
    expect(document.documentElement.dataset['theme']).toBe('dark')
  })

  it('언어를 바꾸면 화면 틀 문구가 바뀐다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('환경설정')

    await user.click(screen.getByRole('radio', { name: 'English' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Settings')
    expect(document.documentElement.lang).toBe('en')
  })

  /* 콘텐츠까지 번역하면 원문과 달라진 것을 알 수 없다 — 그 사실을 화면이 말해야 한다 */
  it('업무 콘텐츠는 번역하지 않는다고 밝힌다', () => {
    render(<Harness />)
    expect(screen.getByText(/원문 그대로 둡니다/)).toBeInTheDocument()
  })

  it('고른 값이 다시 열어도 남는다', async () => {
    const user = userEvent.setup()
    render(<Remount />)
    await user.click(screen.getByRole('radio', { name: '어둡게' }))
    await user.click(screen.getByRole('button', { name: '다시 열기' }))

    expect(screen.getByRole('radio', { name: '어둡게' })).toBeChecked()
    expect(document.documentElement.dataset['theme']).toBe('dark')
  })

  it('기본값으로 되돌린다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('radio', { name: 'English' }))
    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('환경설정')
    expect(document.documentElement.dataset['theme']).toBe(DEFAULT_PREFS.theme)
  })

  it('어디에 저장되는지 말한다', () => {
    render(<Harness />)
    expect(screen.getByText(/이 브라우저에만 적용됩니다/)).toBeInTheDocument()
    expect(screen.getByText('이 브라우저에 저장됩니다.')).toBeInTheDocument()
  })
})
