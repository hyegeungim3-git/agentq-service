import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTranslate } from './useTranslate'
import * as docApi from '@shared/api/documents'

const NO_DELAY = { delayMs: 0 }

describe('useTranslate', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('성적서만 대상으로 불러온다', async () => {
    const { result } = renderHook(() => useTranslate(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))
    expect(result.current.docs.every((d) => d.kind === 'certificate')).toBe(true)
    expect(result.current.documentId).toBe('doc-inspection-cert')
  })

  it('번역하면 문장·용어집·역번역 결과가 나온다', async () => {
    const { result } = renderHook(() => useTranslate(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))
    await act(async () => {
      await result.current.run()
    })
    expect(result.current.phase.kind).toBe('done')
    if (result.current.phase.kind !== 'done') return
    const r = result.current.phase.result
    expect(r.segments.length).toBeGreaterThan(0)
    expect(r.glossaryUsed.length).toBeGreaterThan(0)
    expect(r.backChecks.length).toBeGreaterThan(0)
  })

  /* 이 테스트가 이 훅의 존재 이유다 — 토글이 결과를 바꾸지 않으면 장식이다 */
  it('용어집을 끄면 적용 흔적이 사라지고 신뢰도가 내려간다', async () => {
    const { result } = renderHook(() => useTranslate(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('ready'))

    await act(async () => {
      await result.current.run()
    })
    const withG = result.current.phase.kind === 'done' ? result.current.phase.result : null

    act(() => result.current.setUseGlossary(false))
    await act(async () => {
      await result.current.run()
    })
    const withoutG = result.current.phase.kind === 'done' ? result.current.phase.result : null

    expect(withG!.glossaryUsed.length).toBeGreaterThan(0)
    expect(withoutG!.glossaryUsed).toHaveLength(0)
    expect(withoutG!.segments[0]!.appliedTerms).toHaveLength(0)
    expect(withoutG!.segments[0]!.confidence).toBeLessThan(withG!.segments[0]!.confidence)
  })

  it('문서 목록 실패는 오류로 남는다', async () => {
    vi.spyOn(docApi, 'fetchDocuments').mockResolvedValue({ ok: false, error: '연결 실패' })
    const { result } = renderHook(() => useTranslate(NO_DELAY))
    await waitFor(() => expect(result.current.phase.kind).toBe('docsError'))
  })
})
