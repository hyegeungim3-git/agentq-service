import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPage } from './ChatPage'

const setup = () => render(<ChatPage apiOptions={{ delayMs: 0 }} />)
const ask = async (text: string) => {
  await userEvent.type(screen.getByLabelText('질문 입력'), text)
  await userEvent.click(screen.getByRole('button', { name: '전송' }))
}

describe('ChatPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('답변에 근거 문서를 함께 준다', async () => {
    setup()
    await ask('금형 교체 주기 알려줘')
    expect(await screen.findByText(/타수 50만 타/)).toBeInTheDocument()
    expect(screen.getByText(/SOP-PR-011 · 제4장/)).toBeInTheDocument()
  })

  /* 대화형은 근거를 확인하지 않고 넘어가기 쉬워 더 위험하다 */
  it('모르는 질문은 지어내지 않고 근거 없음을 표시한다', async () => {
    setup()
    await ask('사내 동호회 지원금 얼마야')
    expect(await screen.findByText(/지어내지 않기 위해/)).toBeInTheDocument()
    expect(screen.getByText('근거 문서 없음 · 담당 부서 확인 필요')).toBeInTheDocument()
  })

  it('신뢰도가 낮으면 원문 확인을 권한다', async () => {
    setup()
    await ask('출장 여비 기준')
    expect(await screen.findByText(/원문 확인 권장/)).toBeInTheDocument()
  })

  it('더 나은 에이전트가 있으면 안내한다', async () => {
    setup()
    await ask('진동 알람 어떻게 해')
    // 부모 <p>와 <span> 양쪽에 걸리므로 이유 문장으로 좁힌다
    expect(await screen.findByText(/설비별 실측값을 표로 확인하려면/)).toBeInTheDocument()
  })

  it('빈 입력은 전송할 수 없다', () => {
    setup()
    expect(screen.getByRole('button', { name: '전송' })).toBeDisabled()
  })

  it('Enter로 전송된다 — 안내한 대로 동작해야 한다', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('질문 입력'), '금형 교체 주기{Enter}')
    expect(await screen.findByText(/타수 50만 타/)).toBeInTheDocument()
  })

  it('대화를 지울 수 있다', async () => {
    setup()
    await ask('금형 교체 주기')
    await screen.findByText(/타수 50만 타/)
    await userEvent.click(screen.getByRole('button', { name: '대화 지우기' }))
    expect(screen.queryByText(/타수 50만 타/)).not.toBeInTheDocument()
  })

  /* 출처 이름만 대면 사용자는 확인할 방법이 없다 */
  describe('출처 원문', () => {
    it('출처를 누르면 원문이 펼쳐진다', async () => {
      setup()
      await ask('금형 교체 주기 알려줘')
      const chip = await screen.findByRole('button', { name: /제4장 금형 수명 관리/ })
      expect(chip).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(chip)
      expect(await screen.findByText(/타수 50만 타를 교체 기준으로 하며/)).toBeInTheDocument()
    })

    /* 같은 조항을 두 화면이 다르게 인용하면 어느 쪽이 맞는지 알 수 없다 */
    it('규정 인용은 내규 조회와 같은 원문과 개정일을 보여준다', async () => {
      setup()
      await ask('출장 여비 기준')
      const chip = await screen.findByRole('button', { name: /제23조 제2항/ })
      expect(chip).toHaveTextContent('2025-07-01 개정')
      await userEvent.click(chip)
      expect(
        await screen.findByText(/1일 60,000원을 기준으로 하되, 실비가 이를 초과하는 경우/),
      ).toBeInTheDocument()
    })
  })

  describe('자주 묻는 질문', () => {
    it('범주를 고르면 그 범주 질문만 남는다', async () => {
      setup()
      const faq = await screen.findByRole('region', { name: '자주 묻는 질문' })
      expect(faq).toHaveTextContent('출장 여비 기준 알려줘')

      await userEvent.click(screen.getByRole('radio', { name: '업무기준' }))
      expect(faq).toHaveTextContent('초품 검사는 언제 실시하나요?')
      expect(faq).not.toHaveTextContent('출장 여비 기준 알려줘')
    })

    it('질문을 누르면 바로 물어본다', async () => {
      setup()
      /* 같은 질문이 추천 카드와 아래 목록 양쪽에 있다 — 목록 쪽에서 누른다 */
      const faq = await screen.findByRole('region', { name: '자주 묻는 질문' })
      await userEvent.click(within(faq).getByRole('button', { name: /초품 검사는 언제 실시하나요/ }))
      expect(await screen.findByText(/초품 검사는 금형 교체 직후에 실시합니다/)).toBeInTheDocument()
    })

    /* 목록에 있다고 다 답할 수 있는 건 아니다 — 그 경로가 목록에서도 닿아야 한다 */
    it('목록에 있어도 근거가 없으면 없다고 답한다', async () => {
      setup()
      await userEvent.click(
        await screen.findByRole('button', { name: /기밀 기술자료는 어떻게 처리하나요/ }),
      )
      expect(await screen.findByText('근거 문서 없음 · 담당 부서 확인 필요')).toBeInTheDocument()
    })
  })

  /* 신뢰도 숫자만으로는 무엇을 보고 그 숫자가 나왔는지 알 수 없다 */
  describe('판단 근거', () => {
    it('왜 이 답변인지 펼치면 기여도와 확인할 것을 함께 보여준다', async () => {
      setup()
      await ask('금형 교체 주기 알려줘')
      await screen.findByText(/타수 50만 타/)
      await userEvent.click(screen.getByRole('button', { name: '왜 이 답변인가' }))
      expect(screen.getByText('작업표준 조항 직접 일치')).toBeInTheDocument()
      // 기여도만 보여 주면 근거가 탄탄하다는 인상만 남는다
      expect(screen.getByText(/확인할 것 · 타수 기준은 설비별 예외/)).toBeInTheDocument()
    })

    it('근거 없는 답변에는 판단 근거를 만들어 붙이지 않는다', async () => {
      setup()
      await ask('사내 동호회 지원금 얼마야')
      await screen.findByText(/지어내지 않기 위해/)
      expect(screen.queryByRole('button', { name: '왜 이 답변인가' })).not.toBeInTheDocument()
    })
  })

  /* 보낸 척하면 개선 요청이 접수된 줄 안다 */
  describe('피드백', () => {
    it('아쉬움을 고르면 사유를 물어보고 어디에 남는지 말한다', async () => {
      setup()
      await ask('금형 교체 주기 알려줘')
      await screen.findByText(/타수 50만 타/)
      await userEvent.click(screen.getByRole('button', { name: /아쉬움/ }))
      expect(screen.getByRole('button', { name: '근거가 부족하다' })).toBeInTheDocument()
      expect(screen.getByText(/서버로 보내지 않습니다/)).toBeInTheDocument()
    })

    it('같은 것을 다시 누르면 취소된다 — 잘못 누른 것을 되돌릴 수 있어야 한다', async () => {
      setup()
      await ask('금형 교체 주기 알려줘')
      await screen.findByText(/타수 50만 타/)
      const up = screen.getByRole('button', { name: /도움됨/ })
      await userEvent.click(up)
      expect(up).toHaveAttribute('aria-pressed', 'true')
      await userEvent.click(up)
      expect(up).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('사업장별 지표 지도', () => {
    it('지리 좌표가 아니라는 사실을 먼저 말한다', async () => {
      setup()
      await ask('사업장별 가동률 보여줘')
      expect(await screen.findByText('배치 도식 — 실제 지리 좌표 아님')).toBeInTheDocument()
    })

    /* 값 없는 사업장을 빼면 남은 것이 전부인 줄 안다 */
    it('값이 없는 사업장을 지우지 않고 이유를 말한다', async () => {
      setup()
      await ask('사업장별 가동률 보여줘')
      expect(await screen.findByText(/2개 사업장은 값이 없어 평균에서 빠졌습니다/)).toBeInTheDocument()
      expect(screen.getByText(/천안공장 · MES 미연동/)).toBeInTheDocument()
      expect(screen.getByText(/광주공장 · 2026-06 인수/)).toBeInTheDocument()
      // 빈칸도 칸으로 남는다 — 목록에서 사라지면 안 된다
      expect(screen.getAllByText('값 없음')).toHaveLength(2)
    })

    it('사업장을 누르면 그 사업장의 추이가 나온다', async () => {
      setup()
      await ask('사업장별 가동률 보여줘')
      await userEvent.click(await screen.findByRole('button', { name: /창원본사/ }))
      expect(screen.getByText(/최근 추이 · 88.2% → 81.4%/)).toBeInTheDocument()
    })

    it('값이 없는 사업장을 누르면 없는 이유를 준다', async () => {
      setup()
      await ask('사업장별 가동률 보여줘')
      await userEvent.click(await screen.findByRole('button', { name: /천안공장/ }))
      expect(screen.getByText(/값 없음 — MES 미연동/)).toBeInTheDocument()
    })

    it('지도가 필요 없는 질문에는 지도를 붙이지 않는다', async () => {
      setup()
      await ask('초품 검사 언제 해')
      expect(await screen.findByText(/초품 검사는 금형 교체 직후/)).toBeInTheDocument()
      expect(screen.queryByText('배치 도식 — 실제 지리 좌표 아님')).not.toBeInTheDocument()
    })
  })

  describe('답변 복사', () => {
    /**
     * 본문만 복사하면 붙여 넣은 쪽에서 사람이 쓴 문장과 구분되지 않는다.
     * 그 상태로 결재 문서에 들어가면 아무도 원문을 확인하지 않는다.
     */
    it('근거와 AI 초안 고지를 함께 복사한다', async () => {
      const write = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText: write } })
      setup()
      await ask('금형 교체 주기 알려줘')
      await userEvent.click(await screen.findByRole('button', { name: /답변 복사/ }))

      const copied = String(write.mock.calls[0]?.[0] ?? '')
      expect(copied).toContain('타수 50만 타')
      expect(copied).toContain('근거')
      expect(copied).toContain('SOP-PR-011 · 제4장')
      expect(copied).toContain('AI가 만든 초안')
      expect(await screen.findByText('근거까지 복사했습니다')).toBeInTheDocument()
    })

    /* 근거를 못 찾은 답변은 그 사실이 맨 앞에 와야 복사한 사람이 먼저 본다 */
    it('근거 없는 답변은 그 사실을 첫 줄에 붙인다', async () => {
      const write = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { clipboard: { writeText: write } })
      setup()
      await ask('사내 동호회 지원금 얼마야')
      await userEvent.click(await screen.findByRole('button', { name: /답변 복사/ }))
      expect(String(write.mock.calls[0]?.[0] ?? '').split(/\r?\n/)[0]).toContain('근거 문서 없음')
    })

    /* 조용히 넘기면 복사된 줄 알고 다른 곳에 붙여 넣는다 */
    it('클립보드가 거절하면 실패를 말한다', async () => {
      Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
      setup()
      await ask('금형 교체 주기 알려줘')
      await userEvent.click(await screen.findByRole('button', { name: /답변 복사/ }))
      expect(await screen.findByRole('alert')).toHaveTextContent(/복사하지 못했습니다/)
    })
  })

  describe('파일 첨부', () => {
    /* 형식 검사는 서버가 붙어도 남는다 — 큰 파일을 다 올린 뒤 거절당하지 않게 */
    it('받지 않는 형식은 올리기 전에 거른다', async () => {
      setup()
      const file = new File(['x'], 'sheet.xlsx', { type: 'application/vnd.ms-excel' })
      /* `accept`는 고르는 창을 좁힐 뿐 보장이 아니다 — 끌어다 놓기·다른 브라우저에서는
         그대로 들어온다. 그래서 검사가 실제로 도는지를 보려면 accept를 우회해 넣는다 */
      await userEvent.upload(screen.getByLabelText('파일 첨부'), file, { applyAccept: false })
      expect(await screen.findByRole('alert')).toHaveTextContent(/XLSX 형식은/)
    })

    /* 성공한 척하면 그 문서를 근거로 답할 거라고 믿는다 */
    it('형식이 맞아도 서버가 없으면 실패를 그대로 말한다', async () => {
      setup()
      const file = new File(['x'], 'spec.pdf', { type: 'application/pdf' })
      await userEvent.upload(screen.getByLabelText('파일 첨부'), file)
      expect(await screen.findByRole('alert')).toHaveTextContent(/서버/)
    })
  })

  describe('음성 입력', () => {
    /* 눌러도 아무 일 없는 버튼을 두지 않는다 — 못 하면 못 한다고 이름에 적는다 */
    it('브라우저가 지원하지 않으면 이유를 이름에 담고 눌리지 않는다', () => {
      setup()
      const mic = screen.getByRole('button', { name: /이 브라우저는 지원하지 않습니다/ })
      expect(mic).toBeDisabled()
    })

    /**
     * 인식한 문장을 바로 보내지 않는다.
     *
     * 소음 속 오인식이 그대로 질의가 되면 답도 틀린다. 그리고 브라우저 내장 인식기는
     * 음성을 밖으로 보낼 수 있어, 그 사실을 듣는 동안 화면이 말해야 한다.
     */
    it('받아쓴 문장은 입력창에 채우고 보내지 않는다', async () => {
      class FakeRecognition {
        lang = ''
        continuous = false
        interimResults = false
        onresult: ((e: unknown) => void) | null = null
        onerror: ((e: { error: string }) => void) | null = null
        onend: (() => void) | null = null
        start() {
          this.onresult?.({
            resultIndex: 0,
            results: { length: 1, 0: { isFinal: true, 0: { transcript: '금형 교체 주기 알려줘' } } },
          })
        }
        stop() {
          this.onend?.()
        }
      }
      Object.assign(window, { SpeechRecognition: FakeRecognition })
      setup()
      await userEvent.click(screen.getByRole('button', { name: '음성 입력 시작' }))

      expect(screen.getByLabelText('질문 입력')).toHaveValue('금형 교체 주기 알려줘')
      /* 채워지기만 하고 답은 없어야 한다 */
      expect(screen.queryByText(/타수 50만 타/)).not.toBeInTheDocument()
      expect(screen.getByText(/음성이 외부로 나갈 수 있습니다/)).toBeInTheDocument()
      Reflect.deleteProperty(window, 'SpeechRecognition')
    })
  })

  describe('코드로 찾기', () => {
    it('등록되지 않은 코드는 넘겨짚지 않는다', async () => {
      setup()
      await userEvent.click(screen.getByRole('button', { name: '코드로 찾기' }))
      await userEvent.type(await screen.findByLabelText('코드 직접 입력'), 'PRS-C99')
      await userEvent.click(screen.getByRole('button', { name: '찾기' }))
      expect(await screen.findByRole('alert')).toHaveTextContent(/등록되지 않은 코드입니다: PRS-C99/)
    })

    /* 코드 인식도 오인식이 있다 — 옆 설비 코드를 읽은 채 질의가 나가면 안 된다 */
    it('고른 코드는 입력창에 채우고 보내지 않는다', async () => {
      setup()
      await userEvent.click(screen.getByRole('button', { name: '코드로 찾기' }))
      /* 목록 버튼의 이름은 '설비 PRS-C03 프레스 3호기'로 읽힌다 — 종류 배지가 앞에 온다 */
      await userEvent.click(await screen.findByRole('button', { name: /설비 PRS-C03/ }))
      expect(screen.getByLabelText('질문 입력')).toHaveValue('PRS-C03 진동 추이와 관리 기준 알려줘')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      /* 채워지기만 하고 질의가 나가면 안 된다 — 옆 설비 코드를 잘못 읽었을 수 있다.
         보냈는지는 대화 목록이 늘었는지로 본다 */
      expect(within(screen.getByRole('list', { name: '대화' })).queryAllByRole('listitem')).toHaveLength(0)
    })

    /* 카메라에만 기대면 지원 안 하는 기기에서 없는 기능이 된다 */
    it('카메라를 못 쓰면 목록과 직접 입력으로 가라고 말한다', async () => {
      setup()
      await userEvent.click(screen.getByRole('button', { name: '코드로 찾기' }))
      await userEvent.click(await screen.findByRole('button', { name: '카메라로 찍기' }))
      expect(await screen.findByText(/코드 인식을 지원하지 않습니다/)).toBeInTheDocument()
      expect(screen.getByLabelText('코드 직접 입력')).toBeInTheDocument()
    })
  })

  describe('지식참조 토글', () => {
    /* 눌러도 아무 일 없는 토글을 두지 않는다 — 끄면 실제로 달라져야 한다 */
    it('끄고 보내면 서버가 필요하다고 말하고 보내지 않는다', async () => {
      setup()
      await userEvent.click(screen.getByRole('button', { name: /지식참조/ }))
      await userEvent.type(screen.getByLabelText('질문 입력'), '금형 교체 주기')
      await userEvent.click(screen.getByRole('button', { name: '전송' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(/서버의 모델이 직접 답해야/)
      expect(within(screen.getByRole('list', { name: '대화' })).queryAllByRole('listitem')).toHaveLength(0)
    })

    it('다시 켜면 평소대로 답한다', async () => {
      setup()
      const toggle = screen.getByRole('button', { name: /지식참조/ })
      await userEvent.click(toggle)
      await userEvent.click(toggle)
      await ask('금형 교체 주기 알려줘')
      expect(await screen.findByText(/타수 50만 타/)).toBeInTheDocument()
    })
  })

})
