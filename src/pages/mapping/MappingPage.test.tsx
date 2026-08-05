import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MappingPage } from './MappingPage'

const setup = () => render(<MappingPage apiOptions={{ delayMs: 0 }} />)
const analyze = async () => {
  setup()
  /* 처리 유형은 발주처가 정한다 — 목록이 오기 전에는 실행 버튼도 없다 */
  await userEvent.click(await screen.findByRole('button', { name: '태그·코드 매핑 분석' }))
  return screen.findByRole('region', { name: '표준화 현황' })
}

describe('MappingPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  /* AI로 되는 것과 안 되는 것을 섞으면 계획이 어긋난다 */
  it('AI로 해결되지 않는 건수와 표준화율 상한을 밝힌다', async () => {
    const s = await analyze()
    expect(s).toHaveTextContent('660개는 AI로 해결되지 않습니다')
    expect(s).toHaveTextContent('86%가 상한입니다')
  })

  it('미매칭 사유마다 AI 처리 가능 여부를 표시한다', async () => {
    await analyze()
    const r = await screen.findByRole('region', { name: '미매칭 사유' })
    expect(r).toHaveTextContent('로트 키 미발행')
    expect(r).toHaveTextContent('설비 제어기 펌웨어 업데이트')
  })

  it('자동 확정을 반영하면 표준화율 변화가 보인다', async () => {
    await analyze()
    await userEvent.click(screen.getByRole('button', { name: /자동 확정 1,172건 반영/ }))
    // 화면의 후보 7건은 예시다 — 반영 효과는 집계값으로 계산돼야 한다
    expect(await screen.findByText(/표준화 62% → 86%/)).toBeInTheDocument()
  })

  it('필터로 상태별 후보만 볼 수 있다', async () => {
    await analyze()
    await userEvent.click(screen.getByRole('button', { name: '표준화 불가' }))
    const c = screen.getByRole('region', { name: '매핑 후보' })
    expect(c).toHaveTextContent('LOT_KEY')
    expect(c).not.toHaveTextContent('P1_PRS3_VIB')
  })

  /* AI가 못 하는 일을 못 한다고 말하는 자리 */
  it('표준화 불가 후보는 무엇이 필요한지 밝힌다', async () => {
    await analyze()
    await userEvent.click(screen.getByRole('button', { name: '표준화 불가' }))
    const rows = screen.getAllByRole('button', { name: '근거 보기' })
    await userEvent.click(rows[0]!)
    expect(await screen.findByText(/AI로는 해결할 수 없습니다/)).toBeInTheDocument()
  })

  /* 주소 처리 4종 — 태그 매핑과 같은 3분류 판정을 쓴다 */
  describe('주소 처리', () => {
    const pickMode = async (name: RegExp) => {
      setup()
      /* 처리 유형 목록은 발주처에서 온다 — 오기 전에는 라디오가 없다 */
      await userEvent.click(await screen.findByRole('radio', { name }))
    }
    const typeAndRun = async (value: string, runName: RegExp) => {
      await userEvent.type(screen.getByRole('textbox'), value)
      await userEvent.click(screen.getByRole('button', { name: runName }))
    }

    it('건물까지 특정되면 자동 확정으로 판정한다', async () => {
      await pickMode(/단일 주소/)
      await typeAndRun('창원본사 공단로 274', /주소 표준화$/)
      const r = await screen.findByRole('region', { name: '주소 표준화 결과' })
      expect(r).toHaveTextContent('자동 확정 가능')
      expect(r).toHaveTextContent('경상남도 창원시 성산구 공단로 274')
      expect(r).toHaveTextContent('4812310300')
    })

    /* 도로명까지 맞아도 건물이 특정 안 되면 자동이 아니다 */
    it('동·호가 없으면 사람 확인 필요로 남긴다', async () => {
      await pickMode(/단일 주소/)
      await typeAndRun('대성정밀공업 부산 사상구', /주소 표준화$/)
      const r = await screen.findByRole('region', { name: '주소 표준화 결과' })
      expect(r).toHaveTextContent('사람 확인 필요')
      expect(r).toHaveTextContent('동·호가 없어 건물 미특정')
    })

    it('국내 주소 체계로 못 바꾸는 것은 불가로 판정하고 이유를 말한다', async () => {
      await pickMode(/단일 주소/)
      await typeAndRun('1F, 21 Jurong East St 31, Singapore', /주소 표준화$/)
      const r = await screen.findByRole('region', { name: '주소 표준화 결과' })
      expect(r).toHaveTextContent('표준화 불가')
      expect(r).toHaveTextContent('해외 주소는 국내 도로명주소 체계로 변환할 수 없습니다')
    })

    /* 목록을 다 읽기 전에 '몇 건이 사람 몫인지'를 알아야 한다 */
    it('일괄 처리는 판정별 건수를 먼저 말한다', async () => {
      await pickMode(/일괄 처리/)
      await userEvent.click(screen.getByRole('button', { name: /주소 표준화$/ }))
      const r = await screen.findByRole('region', { name: /일괄 표준화 결과 6건/ })
      expect(r).toHaveTextContent('6건 중 4건은 사람이 봐야 합니다')
      expect(r).toHaveTextContent('그중 2건은 AI로 해결되지 않습니다')
    })

    /* 잘못 읽은 글자로 만든 '정상 주소'가 제일 위험하다 */
    it('OCR 신뢰도가 낮은 줄은 표준화하지 않는다', async () => {
      await pickMode(/OCR 파일/)
      await userEvent.click(screen.getByRole('button', { name: /주소 표준화$/ }))
      const r = await screen.findByRole('region', { name: /문서에서 뽑은 주소 3건/ })
      expect(r).toHaveTextContent('1건은 OCR 신뢰도가 낮아 표준화하지 않았습니다')
      expect(r).toHaveTextContent('OCR 신뢰도가 낮아 원문을 신뢰할 수 없습니다')
    })

    it('폐지된 코드는 조회되더라도 그대로 쓰지 말라고 말한다', async () => {
      await pickMode(/코드 역조회/)
      await typeAndRun('4812110100', /코드 조회/)
      const r = await screen.findByRole('region', { name: '코드 역조회 결과' })
      expect(r).toHaveTextContent('사람 확인 필요')
      expect(r).toHaveTextContent('폐지된 코드입니다. 현행 코드 4812110200')
    })

    it('없는 코드는 지어내지 않고 무엇을 확인할지 알려준다', async () => {
      await pickMode(/코드 역조회/)
      await typeAndRun('9999999999', /코드 조회/)
      const r = await screen.findByRole('region', { name: '코드 역조회 결과' })
      expect(r).toHaveTextContent('표준화 불가')
      expect(r).toHaveTextContent('대장에 없는 코드입니다')
    })

    /* 다른 유형의 결과가 남아 있으면 방금 돌린 것으로 오해한다 */
    it('처리 유형을 바꾸면 이전 결과가 사라진다', async () => {
      setup()
      await userEvent.click(await screen.findByRole('button', { name: '태그·코드 매핑 분석' }))
      await screen.findByRole('region', { name: '표준화 현황' })

      await userEvent.click(screen.getByRole('radio', { name: /단일 주소/ }))
      expect(screen.queryByRole('region', { name: '표준화 현황' })).not.toBeInTheDocument()
    })

    it('입력이 비면 실행하지 않고 무엇이 필요한지 말한다', async () => {
      await pickMode(/단일 주소/)
      await userEvent.click(screen.getByRole('button', { name: /주소 표준화$/ }))
      expect(await screen.findByRole('alert')).toHaveTextContent('변환할 주소를 입력해 주세요')
    })
  })
})
