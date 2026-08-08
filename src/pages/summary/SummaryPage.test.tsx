import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryPage } from './SummaryPage'
import * as api from '@shared/api/summary'
import * as docApi from '@shared/api/documents'

const NO_DELAY = { delayMs: 0 }
const setup = () => render(<SummaryPage apiOptions={NO_DELAY} />)

describe('SummaryPage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('문서 목록과 요약 방식을 보여준다', async () => {
    setup()
    expect(await screen.findByText('프레스_작업표준서_SOP-PR-011.pdf')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /상세 요약/ })).toBeChecked()
  })

  /* 업로드는 파일을 목록에 얹는 일이 아니라 서버가 본문을 뽑아내는 일이다.
     서버가 없으면 성공한 척하지 않는다 — 그러면 남의 문서에 대해
     다른 문서의 분석 결과를 보여 주게 된다. */
  describe('업로드', () => {
    /* applyAccept를 끄는 이유: accept 속성은 파일 대화상자의 기본 필터일 뿐
       강제가 아니다. 사용자가 '모든 파일'을 고르거나 끌어다 놓으면 그대로 들어온다. */
    const pick = async (file: File, applyAccept = true) => {
      const input = document.querySelector<HTMLInputElement>('input[type="file"]')
      await userEvent.upload(input!, file, { applyAccept })
    }

    it('형식이 맞지 않으면 서버에 보내지 않고 이유를 말한다', async () => {
      const spy = vi.spyOn(docApi, 'uploadDocument')
      setup()
      await screen.findByText('프레스_작업표준서_SOP-PR-011.pdf')
      await pick(new File(['x'], '설치본.exe', { type: 'application/octet-stream' }), false)
      expect(await screen.findByRole('alert')).toHaveTextContent('EXE')
      expect(spy).not.toHaveBeenCalled()
    })

    it('서버가 없으면 실패를 그대로 알린다', async () => {
      setup()
      await screen.findByText('프레스_작업표준서_SOP-PR-011.pdf')
      await pick(new File(['x'], '계약서.pdf', { type: 'application/pdf' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('서버에 연결된 뒤에 동작합니다')
    })

    /* 서버가 붙었을 때의 경로. 지금은 실패만 나지만 배선은 지금 맞춰 둔다 */
    it('서버가 문서를 돌려주면 목록에 얹고 바로 선택한다', async () => {
      vi.spyOn(docApi, 'uploadDocument').mockResolvedValue({
        ok: true,
        data: {
          id: 'doc-uploaded',
          name: '계약서.pdf',
          kind: 'report',
          sizeBytes: 2048,
          text: '올린 문서 본문',
          registeredOn: '2026-08-02',
          security: 'internal',
          indexed: false,
          tags: [],
        },
      })
      setup()
      await screen.findByText('프레스_작업표준서_SOP-PR-011.pdf')
      await pick(new File(['x'], '계약서.pdf', { type: 'application/pdf' }))
      const added = await screen.findByRole('radio', { name: /계약서\.pdf/ })
      expect(added).toBeChecked()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('요약을 생성하면 결과와 통계가 나온다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '요약 생성' }))
    const result = await screen.findByRole('region', { name: /요약 결과/ })
    expect(result).toHaveTextContent('적용 범위')
    expect(result).toHaveTextContent('압축률')
  })

  it('요약 방식을 바꾸면 결과 내용이 달라진다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('radio', { name: /핵심 요약/ }))
    await userEvent.click(screen.getByRole('button', { name: '요약 생성' }))
    const result = await screen.findByRole('region', { name: /요약 결과/ })
    expect(result).toHaveTextContent('핵심 요약')
    /* 본문 텍스트로 판별하면 안 된다 — 핵심 요약 '본문 안에' 상세의 소제목 단어가
       문장으로 등장한다(실제로 이 단언으로 오탐이 났다). 구조로 판별한다:
       핵심 요약은 소제목 1개, 상세 요약은 5개다. */
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2) // 요약 1 + 키워드 1
    expect(screen.getByRole('heading', { level: 3, name: '핵심' })).toBeInTheDocument()
  })

  it('상세 요약은 소제목이 여러 개다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '요약 생성' }))
    await screen.findByRole('region', { name: /요약 결과/ })
    expect(screen.getByRole('heading', { level: 3, name: '적용 범위' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: '이상 대응' })).toBeInTheDocument()
  })

  it('실패하면 오류와 재시도를 보여준다', async () => {
    setup()
    await screen.findByRole('button', { name: '요약 생성' })
    vi.spyOn(api, 'createSummary').mockResolvedValue({ ok: false, error: '모델 응답 없음' })
    await userEvent.click(screen.getByRole('button', { name: '요약 생성' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('모델 응답 없음')
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('문서 목록이 비면 안내를 보여준다', async () => {
    vi.spyOn(docApi, 'fetchDocuments').mockResolvedValue({ ok: true, data: [] })
    setup()
    expect(await screen.findByText('요약할 문서가 없습니다.')).toBeInTheDocument()
  })

  it('문서가 없으면 실행 버튼이 비활성이다', async () => {
    vi.spyOn(docApi, 'fetchDocuments').mockResolvedValue({ ok: true, data: [] })
    setup()
    expect(await screen.findByRole('button', { name: '요약 생성' })).toBeDisabled()
  })

  it('관점 칩을 선택할 수 있다', async () => {
    setup()
    const chip = await screen.findByRole('checkbox', { name: '위험 요소' })
    await userEvent.click(chip)
    expect(chip).toBeChecked()
  })

  it('AI 생성물 고지를 항상 붙인다', async () => {
    setup()
    await userEvent.click(await screen.findByRole('button', { name: '요약 생성' }))
    expect(await screen.findByText(/AI가 생성한 요약입니다/)).toBeInTheDocument()
  })
})
