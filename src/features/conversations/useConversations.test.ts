import { describe, it, expect } from 'vitest'
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

describe('useConversations', () => {
  /* 목록에 제목이 안 생기면 '최근 대화'는 빈 상자다 */
  it('첫 질문이 대화 제목이 된다', () => {
    const { result } = renderHook(() => useConversations())
    expect(result.current.listed).toHaveLength(0)

    act(() => result.current.store.setMessages(() => [user('금형 교체 주기')]))
    expect(result.current.listed).toHaveLength(1)
    expect(result.current.listed[0]?.title).toBe('금형 교체 주기')
  })

  it('제목이 길면 줄여서 보여준다', () => {
    const { result } = renderHook(() => useConversations())
    act(() => result.current.store.setMessages(() => [user('가'.repeat(40))]))
    expect(result.current.listed[0]?.title).toHaveLength(25) // 24자 + 말줄임
  })

  /* 빈 대화가 쌓이면 목록이 껍데기로 찬다 */
  it('빈 대화가 있으면 새 대화를 또 만들지 않는다', () => {
    const { result } = renderHook(() => useConversations())
    const first = result.current.activeId
    act(() => result.current.startNew())
    expect(result.current.activeId).toBe(first)
    expect(result.current.items).toHaveLength(1)
  })

  it('대화를 나누고 새로 시작하면 이전 것이 목록에 남는다', () => {
    const { result } = renderHook(() => useConversations())
    act(() => result.current.store.setMessages(() => [user('첫 질문')]))
    act(() => result.current.startNew())

    expect(result.current.items).toHaveLength(2)
    expect(result.current.listed).toHaveLength(1)
    // 새 대화는 비어 있다
    expect(result.current.store.messages).toEqual([])
  })

  /* 고른 대화가 화면에 안 뜨면 목록이 장식이 된다 */
  it('이전 대화를 고르면 그 메시지로 돌아간다', () => {
    const { result } = renderHook(() => useConversations())
    act(() => result.current.store.setMessages(() => [user('첫 질문')]))
    const firstId = result.current.activeId

    act(() => result.current.startNew())
    act(() => result.current.store.setMessages(() => [user('둘째 질문')]))
    expect(result.current.store.messages[0]?.text).toBe('둘째 질문')

    act(() => result.current.select(firstId))
    expect(result.current.store.messages[0]?.text).toBe('첫 질문')
  })
})
