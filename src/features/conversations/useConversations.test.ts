import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConversations } from './useConversations'
import type { ChatMessage } from '@entities/chat/model'

const user = (text: string): ChatMessage => ({
  id: `u-${text}`,
  role: 'user',
  text,
  sources: [],
  confidence: null,
  handoff: null,
})

const WS_A = 'ws-a'
const WS_B = 'ws-b'

describe('useConversations', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  /* 목록에 제목이 안 생기면 '최근 대화'는 빈 상자다 */
  it('첫 질문이 대화 제목이 된다', () => {
    const { result } = renderHook(() => useConversations(WS_A))
    expect(result.current.listed).toHaveLength(0)

    act(() => result.current.store.setMessages(() => [user('금형 교체 주기')]))
    expect(result.current.listed).toHaveLength(1)
    expect(result.current.listed[0]?.title).toBe('금형 교체 주기')
  })

  it('제목이 길면 줄여서 보여준다', () => {
    const { result } = renderHook(() => useConversations(WS_A))
    act(() => result.current.store.setMessages(() => [user('가'.repeat(40))]))
    expect(result.current.listed[0]?.title).toHaveLength(25) // 24자 + 말줄임
  })

  it('이전 대화를 고르면 그 메시지로 돌아간다', () => {
    const { result } = renderHook(() => useConversations(WS_A))
    act(() => result.current.store.setMessages(() => [user('첫 질문')]))
    const firstId = result.current.activeId

    act(() => result.current.startNew())
    act(() => result.current.store.setMessages(() => [user('둘째 질문')]))
    expect(result.current.store.messages[0]?.text).toBe('둘째 질문')

    act(() => result.current.select(firstId))
    expect(result.current.store.messages[0]?.text).toBe('첫 질문')
  })

  /* 워크스페이스가 대화를 실제로 나누지 않으면 이름표에 불과하다 */
  describe('워크스페이스', () => {
    it('다른 워크스페이스의 대화는 목록에 보이지 않는다', () => {
      const { result, rerender } = renderHook(({ ws }) => useConversations(ws), {
        initialProps: { ws: WS_A },
      })
      act(() => result.current.store.setMessages(() => [user('A방 질문')]))
      expect(result.current.listed).toHaveLength(1)

      rerender({ ws: WS_B })
      expect(result.current.listed).toHaveLength(0)
      expect(result.current.store.messages).toEqual([])

      act(() => result.current.store.setMessages(() => [user('B방 질문')]))
      expect(result.current.listed.map((c) => c.title)).toEqual(['B방 질문'])

      rerender({ ws: WS_A })
      expect(result.current.listed.map((c) => c.title)).toEqual(['A방 질문'])
    })
  })

  /* 저장한 것을 되돌릴 방법이 없으면 정책이 정해질 때 손댈 수 없다 */
  describe('저장과 지우기', () => {
    it('새로고침해도 대화가 남는다', () => {
      const first = renderHook(() => useConversations(WS_A))
      act(() => first.result.current.store.setMessages(() => [user('저장될 질문')]))
      first.unmount()

      const second = renderHook(() => useConversations(WS_A))
      expect(second.result.current.listed.map((c) => c.title)).toEqual(['저장될 질문'])
    })

    it('한 건만 지울 수 있다', () => {
      const { result } = renderHook(() => useConversations(WS_A))
      act(() => result.current.store.setMessages(() => [user('첫 질문')]))
      act(() => result.current.startNew())
      act(() => result.current.store.setMessages(() => [user('둘째 질문')]))
      expect(result.current.listed).toHaveLength(2)

      act(() => result.current.remove(result.current.listed[0]!.id))
      expect(result.current.listed).toHaveLength(1)
    })

    it('전체 지우기는 저장소까지 비운다', () => {
      const { result } = renderHook(() => useConversations(WS_A))
      act(() => result.current.store.setMessages(() => [user('지울 질문')]))
      expect(window.localStorage.getItem('agentq.conversations.v1')).not.toBeNull()

      act(() => result.current.clearAll())
      expect(result.current.listed).toHaveLength(0)
      expect(window.localStorage.getItem('agentq.conversations.v1')).toBeNull()
    })

    /* 저장이 막힌 환경은 실제로 있다 — 조용히 성공한 척하면 안 된다 */
    it('저장이 막히면 막혔다고 알린다', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
      const { result } = renderHook(() => useConversations(WS_A))
      act(() => result.current.store.setMessages(() => [user('질문')]))
      expect(result.current.persisted).toBe(false)
      // 저장은 못 해도 화면에서는 계속 쓸 수 있어야 한다
      expect(result.current.listed).toHaveLength(1)
    })

    it('저장된 값이 깨져 있으면 무시하고 빈 목록으로 시작한다', () => {
      window.localStorage.setItem('agentq.conversations.v1', '{"broken":true}')
      const { result } = renderHook(() => useConversations(WS_A))
      expect(result.current.listed).toHaveLength(0)
    })
  })
})
