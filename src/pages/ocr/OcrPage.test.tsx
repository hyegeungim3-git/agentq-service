import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OcrPage } from './OcrPage'

const setup = () => render(<OcrPage apiOptions={{ delayMs: 0 }} />)

describe('OcrPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* 못 읽은 줄을 감추면 잘못된 값이 그대로 흘러간다 */
  it('신뢰도가 낮은 줄을 표시하고 건수를 알린다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '문서 인식' }))
    const r = await screen.findByRole('region', { name: '인식 결과' })
    expect(r).toHaveTextContent('확인 필요')
    expect(r).toHaveTextContent('미만인 줄이 2개 있습니다')
  })

  it('마스킹을 켜면 원문이 가려지고 무엇을 가렸는지 남는다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '문서 인식' }))
    const mask = await screen.findByRole('region', { name: '개인정보 마스킹' })
    expect(mask).toHaveTextContent('010-****-7734')
    expect(mask).toHaveTextContent('연락처')
    expect(screen.getByRole('region', { name: '인식 결과' })).not.toHaveTextContent('010-4821-7734')
  })

  it('마스킹을 끄면 원문이 남고 주의를 알린다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('checkbox', { name: /개인정보 자동 마스킹/ }))
    await userEvent.click(screen.getByRole('button', { name: '문서 인식' }))
    expect(await screen.findByText(/외부 공유에 주의/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '인식 결과' })).toHaveTextContent('010-4821-7734')
  })

  /* 설정이 결과를 바꾸지 않으면 고르는 행위에 의미가 없다.
     아래는 설정 하나하나가 실제로 결과를 바꾸는지 확인한다. */
  describe('인식 설정', () => {
    const runWith = async (setUp: () => Promise<void>) => {
      setup()
      await screen.findByRole('button', { name: '문서 인식' })
      await setUp()
      await userEvent.click(screen.getByRole('button', { name: '문서 인식' }))
      return screen.findByRole('region', { name: '인식 결과' })
    }

    it('언어를 잘못 고르면 신뢰도가 떨어지고 그 이유를 말한다', async () => {
      const r = await runWith(async () => {
        await userEvent.click(screen.getByRole('radio', { name: /영어만/ }))
      })
      expect(r).toHaveTextContent(/영어만으로 인식해 한글이 섞인 \d+줄/)
      // 한글 줄이 확 떨어진다 — 기본 설정의 2줄보다 많아야 한다
      expect(r).toHaveTextContent(/미만인 줄이 [3-9]개 있습니다/)
    })

    it('수치 정밀 인식을 켜면 확인 필요 줄이 줄어든다', async () => {
      const r = await runWith(async () => {
        await userEvent.click(screen.getByRole('checkbox', { name: /수치 정밀 인식/ }))
      })
      expect(r).toHaveTextContent('미만인 줄이 1개 있습니다')
      expect(r).not.toHaveTextContent('수치 정밀 인식이 꺼져 있어')
    })

    it('표 추출은 켰을 때만 표가 나온다', async () => {
      setup()
      await userEvent.click(await screen.findByRole('button', { name: '문서 인식' }))
      await screen.findByRole('region', { name: '인식 결과' })
      expect(screen.queryByRole('region', { name: '추출한 표' })).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: '다시 설정' }))
      await userEvent.click(screen.getByRole('checkbox', { name: /표 추출/ }))
      await userEvent.click(screen.getByRole('button', { name: '문서 인식' }))
      const table = await screen.findByRole('table', { name: '추출한 표' })
      expect(table).toHaveTextContent('로트번호')
      expect(table).toHaveTextContent('SPCC-2211')
    })

    it('성적서 특화 모드에서만 규격 대비 판정이 나온다', async () => {
      const r = await runWith(async () => {
        await userEvent.click(screen.getByRole('radio', { name: /도면·성적서 특화/ }))
      })
      expect(r).toBeInTheDocument()
      const spec = await screen.findByRole('region', { name: '규격 대비 판정' })
      expect(spec).toHaveTextContent('58.0 HRC 이상')
      expect(spec).toHaveTextContent('규격 내')
    })

    it('결과 형식을 바꾸면 내보내기 본문이 달라진다', async () => {
      setup()
      await userEvent.click(await screen.findByRole('button', { name: '문서 인식' }))
      const plain = (await screen.findByRole('region', { name: '내보내기 미리보기' })).textContent
      expect(plain).not.toContain('"confidence"')

      await userEvent.click(screen.getByRole('button', { name: '다시 설정' }))
      await userEvent.click(screen.getByRole('radio', { name: /JSON 구조화/ }))
      await userEvent.click(screen.getByRole('button', { name: '문서 인식' }))
      const json = await screen.findByRole('region', { name: '내보내기 미리보기' })
      expect(json).toHaveTextContent('"confidence"')
    })

    /* 더 많이 시키면 더 오래 걸린다 — 설정이 공짜라고 말하지 않는다 */
    it('처리를 더 붙이면 소요 시간이 늘어난다', async () => {
      const r = await runWith(async () => {
        await userEvent.click(screen.getByRole('checkbox', { name: /수치 정밀 인식/ }))
        await userEvent.click(screen.getByRole('checkbox', { name: /표 추출/ }))
      })
      expect(r).toHaveTextContent('12.7초')
    })
  })
})
