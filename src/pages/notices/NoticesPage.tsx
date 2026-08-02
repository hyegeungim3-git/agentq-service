import { useEffect, useState } from 'react'
import { noticeLevelLabel, type Notice } from '@entities/notice/model'
import { fetchNotices } from '@shared/api/notices'

/**
 * 공지사항.
 *
 * 목록을 열면 읽음으로 처리한다 — 안 읽은 건수를 사이드바가 쓰기 때문이다.
 * 읽음 처리를 하지 않으면 배지가 영원히 그대로라 아무 뜻이 없어진다.
 */
export function NoticesPage({ onRead }: { onRead: (ids: string[]) => void }) {
  const [notices, setNotices] = useState<Notice[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void fetchNotices().then((res) => {
      if (!alive) return
      if (!res.ok) {
        setError(res.error)
        return
      }
      setNotices(res.data)
      onRead(res.data.map((n) => n.id))
    })
    return () => {
      alive = false
    }
  }, [onRead])

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-xl font-black text-slate-900">공지사항</h1>
          <p className="mt-1 text-sm text-slate-600">사내 공지와 기준 변경 안내입니다.</p>
        </header>

        {notices === null && !error && (
          <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="sr-only">공지를 불러오는 중입니다</span>
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold text-rose-800">공지를 불러오지 못했습니다</p>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
          </div>
        )}

        {notices?.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            등록된 공지가 없습니다.
          </p>
        )}

        <ul className="space-y-3">
          {(notices ?? []).map((n) => (
            <li key={n.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                {/* 색이 아니라 글자로 구분한다 */}
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    n.level === 'important' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {noticeLevelLabel(n.level)}
                </span>
                <h2 className="text-sm font-black text-slate-900">{n.title}</h2>
                <span className="ml-auto text-xs text-slate-400">{n.postedOn}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen((v) => (v === n.id ? null : n.id))}
                aria-expanded={open === n.id}
                className="mt-2 min-h-11 text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                {open === n.id ? '내용 닫기' : '내용 보기'}
              </button>
              {open === n.id && (
                <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700">
                  {n.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
