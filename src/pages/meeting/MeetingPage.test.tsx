import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeetingPage } from './MeetingPage'

const setup = () => render(<MeetingPage apiOptions={{ delayMs: 0 }} />)

describe('MeetingPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* 정리 대상(라디오)에는 녹음만 나온다.
     문서는 '회의 자료 첨부'(체크박스)에 별도로 나오므로 역할로 구분해 확인한다. */
  it('정리 대상으로는 회의 녹음만 고를 수 있다', async () => {
    setup()
    expect(await screen.findByRole('radio', { name: /공정회의_녹음/ })).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /작업표준서/ })).not.toBeInTheDocument()
    // 같은 문서가 '자료 첨부'에는 있어야 한다 — 맥락으로 붙이는 용도다
    expect(screen.getByRole('checkbox', { name: /작업표준서/ })).toBeInTheDocument()
  })

  it('결정 사항과 조치 항목을 뽑는다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '회의록 작성' }))
    const r = await screen.findByRole('region', { name: /3월 3주 공정회의/ })
    expect(r).toHaveTextContent('진동 관리 기준을 4.5mm/s에서 3.5mm/s로 하향')
    expect(r).toHaveTextContent('PdM 알람 임계치를 3.5mm/s로 변경')
  })

  /* 회의에서 안 정해진 것을 AI가 채우면 안 된다 */
  it('담당자·기한이 미정인 항목을 미정으로 표시하고 건수를 알린다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '회의록 작성' }))
    const r = await screen.findByRole('region', { name: /3월 3주 공정회의/ })
    expect(r).toHaveTextContent('미정')
    expect(await screen.findByText(/정해지지 않은 항목이 2건/)).toBeInTheDocument()
  })

  it('발언 기록을 끄면 해당 영역이 사라진다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('checkbox', { name: /발언 기록 포함/ }))
    await userEvent.click(screen.getByRole('button', { name: '회의록 작성' }))
    await screen.findByRole('region', { name: /3월 3주 공정회의/ })
    expect(screen.queryByRole('region', { name: '발언 기록' })).not.toBeInTheDocument()
  })

  /* 입력 칸이 결과에 안 들어가면 그건 장식이다 */
  describe('회의 자료·참석자·안건', () => {
    const write = async () => {
      await userEvent.click(await screen.findByRole('button', { name: '회의록 작성' }))
      return screen.findByRole('region', { name: /공정회의/ })
    }

    it('자료를 붙이면 결정에 근거가 달리고, 안 붙이면 없다고 말한다', async () => {
      setup()
      const before = await write()
      expect(before).toHaveTextContent('근거 문서 없음 — 발언에만 의존')

      await userEvent.click(screen.getByRole('button', { name: '다시 설정' }))
      await userEvent.click(screen.getByRole('checkbox', { name: /작업표준서/ }))
      const after = await write()
      expect(after).toHaveTextContent('근거 · 프레스_작업표준서_SOP-PR-011.pdf 제5장 이상 대응')
    })

    /* 명단에 없는 발언자는 오인식이거나 미기재 참석자다 */
    it('명단과 발언을 대조해 빠진 사람과 명단 밖 발언자를 드러낸다', async () => {
      setup()
      const r = await write()
      // 기본 명단의 이서준은 발언이 없다
      expect(r).toHaveTextContent('발언 기록 없음 · 이서준')

      await userEvent.click(screen.getByRole('button', { name: '다시 설정' }))
      const box = screen.getByLabelText('참석자 (한 줄에 한 명)')
      await userEvent.clear(box)
      await userEvent.type(box, '박태윤,생산기술팀')
      const r2 = await write()
      // 순서는 발언 순 — 김도현이 먼저 말했다
      expect(r2).toHaveTextContent('명단에 없는 발언자 · 김도현, 한지민')
    })

    it('명단을 비우면 발언자 이름이 추정임을 알린다', async () => {
      setup()
      await userEvent.clear(await screen.findByLabelText('참석자 (한 줄에 한 명)'))
      const r = await write()
      expect(r).toHaveTextContent('발언자 이름은 음성 인식 추정입니다')
    })

    /* 회의가 끝났는데 남은 것 — 이걸 드러내는 게 회의록의 실무 가치다 */
    it('논의되지 않은 안건을 드러낸다', async () => {
      setup()
      const r = await write()
      expect(r).toHaveTextContent('논의 기록 없음')
      expect(r).toHaveTextContent('논의되지 않은 안건이 1건 있습니다 (설비 투자 계획)')
    })

    it('기본 정보를 넣으면 문서 머리가 바뀌고 추정 문구가 사라진다', async () => {
      setup()
      const first = await write()
      expect(first).toHaveTextContent('녹음 파일에서 추정했습니다')

      await userEvent.click(screen.getByRole('button', { name: '다시 설정' }))
      await userEvent.type(screen.getByLabelText('제목'), '3월 4주 공정회의')
      await userEvent.type(screen.getByLabelText('장소'), '아산 대회의실')
      const r = await screen.findByRole('button', { name: '회의록 작성' })
      await userEvent.click(r)
      const after = await screen.findByRole('region', { name: /3월 4주 공정회의/ })
      expect(after).toHaveTextContent('아산 대회의실')
      expect(after).not.toHaveTextContent('녹음 파일에서 추정했습니다')
    })
  })
})
