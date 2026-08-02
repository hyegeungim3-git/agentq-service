import { useCallback, useState } from 'react'
import { readJson, writeJson } from '@shared/lib/storage'

/**
 * 답변 피드백.
 *
 * ⚠️ 지금은 **이 브라우저에만 남는다.** 서버가 없어 보낼 곳이 없다.
 * 보낸 척하면 사용자는 개선 요청이 접수된 줄 안다. 화면이 그 사실을 말한다.
 *
 * 나중에 관리자의 'AI 답변 품질' 화면이 이 값을 집계한다 —
 * 그때 바뀌는 곳은 `shared/api`의 전송 함수 하나다.
 */

export type Verdict = 'up' | 'down'

/** 도움이 안 됐을 때 고르는 이유 — 자유 입력만 두면 대부분 비워 둔다 */
export const DOWN_REASONS = [
  '근거가 부족하다',
  '질문과 다른 답이다',
  '내용이 틀렸다',
  '너무 길거나 어렵다',
] as const

export type FeedbackEntry = {
  verdict: Verdict
  reason: string | null
}

const KEY = 'agentq.feedback.v1'

type Store = Record<string, FeedbackEntry>

const isStore = (v: unknown): v is Store => typeof v === 'object' && v !== null

export function useFeedback() {
  const [entries, setEntries] = useState<Store>(() => readJson<Store>(KEY, isStore) ?? {})
  const [persisted, setPersisted] = useState(true)

  const save = useCallback((next: Store) => {
    setEntries(next)
    setPersisted(writeJson(KEY, next))
  }, [])

  const rate = useCallback(
    (messageId: string, verdict: Verdict) => {
      // 같은 걸 다시 누르면 취소 — 잘못 누른 것을 되돌릴 방법이 있어야 한다
      const cur = entries[messageId]
      if (cur?.verdict === verdict && cur.reason === null) {
        const rest = { ...entries }
        delete rest[messageId]
        save(rest)
        return
      }
      save({ ...entries, [messageId]: { verdict, reason: null } })
    },
    [entries, save],
  )

  const setReason = useCallback(
    (messageId: string, reason: string) => {
      const cur = entries[messageId]
      if (!cur) return
      save({ ...entries, [messageId]: { ...cur, reason } })
    },
    [entries, save],
  )

  return { entries, rate, setReason, persisted }
}

/**
 * 관리자 화면이 읽는 피드백 집계.
 *
 * ⚠️ **이 브라우저에 남은 것만 센다.** 서버가 없어 다른 사람이 누른 것은 여기 없다.
 * 그리고 메시지 id는 새로고침하면 다시 매겨지므로 **어떤 질문이었는지 이어 붙일 수
 * 없다.** 건수만 세고, 그 한계를 화면이 그대로 말한다.
 *
 * 서버가 붙으면 이 함수 대신 집계 API를 부른다.
 */
export type FeedbackSummary = {
  up: number
  down: number
  reasons: { reason: string; count: number }[]
}

export function readFeedbackSummary(): FeedbackSummary {
  const store = readJson<Store>(KEY, isStore) ?? {}
  const entries = Object.values(store)
  const counts = new Map<string, number>()
  for (const e of entries) {
    if (e.reason) counts.set(e.reason, (counts.get(e.reason) ?? 0) + 1)
  }
  return {
    up: entries.filter((e) => e.verdict === 'up').length,
    down: entries.filter((e) => e.verdict === 'down').length,
    reasons: [...counts.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
  }
}
