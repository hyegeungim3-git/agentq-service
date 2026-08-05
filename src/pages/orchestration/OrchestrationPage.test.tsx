import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrchestrationPage } from './OrchestrationPage'
import * as ocrApi from '@shared/api/ocr'

const setup = () => render(<OrchestrationPage apiOptions={{ delayMs: 0 }} />)
const relay = async () => {
  await userEvent.click(await screen.findByRole('button', { name: '릴레이 실행' }))
}

describe('OrchestrationPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('단계와 넘겨받는 값을 미리 보여준다', async () => {
    setup()
    // 산출물 이름과 마지막 단계 제목이 같으므로 제목으로 좁힌다
    for (const title of ['성적서 인식', '공급업체 주소 표준화', '해당 설비 이력 조회', '이상 발생 보고 초안']) {
      expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument()
    }
    expect(screen.getByText(/인식된 본문에서 뽑은 주소 줄/)).toBeInTheDocument()
  })

  /* 서버가 붙으면 무엇이 바뀌는지 화면이 보여 준다 */
  it('각 단계가 실제로 부르는 데이터 경계를 밝힌다', async () => {
    setup()
    expect(await screen.findByText(/shared\/api\/ocr · recognizeDocument/)).toBeInTheDocument()
    expect(screen.getByText(/shared\/api\/report · createReport/)).toBeInTheDocument()
  })

  it('릴레이가 끝까지 진행되고 산출물 문서번호가 나온다', async () => {
    setup()
    await relay()
    expect(await screen.findByText(/HBP-보전-2026-102 초안 작성/)).toBeInTheDocument()
  })

  /* 이 화면의 존재 이유 — 끝까지 갔다고 다 된 게 아니다 */
  it('끝까지 갔어도 사람이 확인할 지점을 합계로 먼저 말한다', async () => {
    setup()
    await relay()
    const notice = await screen.findByText(/사람이 확인해야 하는 지점이 \d+건 남았습니다/)
    expect(notice).toBeInTheDocument()
    expect(screen.getByText(/결재에 올리기 전에/)).toBeInTheDocument()
  })

  /* 단계는 에이전트 결과를 그대로 물려받는다 — 따로 흉내 낸 값이 아니다 */
  it('단계별 확인 지점은 해당 에이전트의 결과에서 나온다', async () => {
    setup()
    await relay()
    await screen.findByText(/HBP-보전-2026-102/)
    // OCR: 신뢰도 낮은 줄, 주소: 표준화 못 한 건, 보고서: 미기재 칸
    expect(screen.getByText(/번째 줄 신뢰도 \d+% — 원본 대조 필요/)).toBeInTheDocument()
    expect(screen.getByText(/인식 신뢰도가 낮아 표준화하지 못함/)).toBeInTheDocument()
    expect(screen.getByText(/보고서 미기재 — 재발 방지 대책/)).toBeInTheDocument()
  })

  /* 한 단계가 실패하면 멈추고, 뒤 단계를 성공한 척하지 않는다 */
  it('중간 단계가 실패하면 거기서 멈춘다', async () => {
    vi.spyOn(ocrApi, 'recognizeDocument').mockResolvedValue({ ok: false, error: 'OCR 엔진 응답 없음' })
    setup()
    await relay()
    expect(await screen.findByRole('alert')).toHaveTextContent('OCR 엔진 응답 없음')
    expect(screen.queryByText(/초안 작성/)).not.toBeInTheDocument()
    expect(screen.queryByText(/사람이 확인해야 하는 지점이/)).not.toBeInTheDocument()
  })
})
