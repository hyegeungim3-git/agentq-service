import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSummarize } from './useSummarize'
import * as api from '@shared/api/summary'
import * as docApi from '@shared/api/documents'

const NO_DELAY = { delayMs: 0 }

describe('useSummarize', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('문서를 불러오면 첫 문서를 선택하고 준비 상태가 된다', async () => {
    const { result } = renderHook(() => useSummarize(NO_DELAY))
    expect(result.current.phase.kind).toBe('loadingDocs')
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))
    expect(result.current.documentId).toBe('doc-press-sop')
    expect(result.current.docs.length).toBeGreaterThan(0)
  })

  it('문서 목록 실패는 오류 상태로 남는다 — 빈 화면으로 두지 않는다', async () => {
    vi.spyOn(docApi, 'fetchDocuments').mockResolvedValue({ ok: false, error: '연결 실패' })
    const { result } = renderHook(() => useSummarize(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('docsError'))
  })

  it('실행하면 running을 거쳐 done이 된다', async () => {
    const { result } = renderHook(() => useSummarize(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))
    await act(async () => {
      await result.current.run()
    })
    expect(result.current.phase.kind).toBe('done')
  })

  it('요약 방식을 바꾸면 결과 내용이 실제로 달라진다', async () => {
    const { result } = renderHook(() => useSummarize(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))

    await act(async () => {
      await result.current.run()
    })
    const detailed = result.current.phase.kind === 'done' ? result.current.phase.result : null

    act(() => result.current.setStyle('brief'))
    await act(async () => {
      await result.current.run()
    })
    const brief = result.current.phase.kind === 'done' ? result.current.phase.result : null

    expect(detailed!.sections.length).toBeGreaterThan(brief!.sections.length)
    expect(detailed!.stats.summaryChars).toBeGreaterThan(brief!.stats.summaryChars)
  })

  it('요약 실패는 실패로 드러낸다', async () => {
    const { result } = renderHook(() => useSummarize(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))
    vi.spyOn(api, 'createSummary').mockResolvedValue({ ok: false, error: '모델 응답 없음' })
    await act(async () => {
      await result.current.run()
    })
    expect(result.current.phase).toEqual({ kind: 'failed', message: '모델 응답 없음' })
  })

  it('관점 선택은 토글된다', async () => {
    const { result } = renderHook(() => useSummarize(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))
    act(() => result.current.toggleFocus('risk'))
    expect(result.current.focusAreas).toEqual(['risk'])
    act(() => result.current.toggleFocus('risk'))
    expect(result.current.focusAreas).toEqual([])
  })

  it('reset은 결과만 지우고 설정은 남긴다', async () => {
    const { result } = renderHook(() => useSummarize(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))
    act(() => result.current.setStyle('bullet'))
    await act(async () => {
      await result.current.run()
    })
    act(() => result.current.reset())
    expect(result.current.phase.kind).toBe('ready')
    expect(result.current.style).toBe('bullet')
  })
})
