import { useState } from 'react'
import { noticeLevelLabel } from '@entities/notice/model'
import { faqCategoryLabel } from '@entities/chat/model'
import { fetchManagedFaq, fetchManagedNotices, saveNotice } from '@shared/api/oplog'
import { useRemote } from '@features/remote/useRemote'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'
import { AdminTabs } from '@widgets/admin-shell/AdminControls'
import { Button } from '@shared/ui/Button'

/**
 * 콘텐츠 관리 — 공지사항·Q&A·설문.
 *
 * **여기 보이는 것이 곧 사용자 포털에 보이는 것이다.** 관리자가 따로 목록을 갖고
 * 있으면 '여기서 고쳤는데 포털에 안 나오는' 상태가 생긴다. 같은 자원을 읽고,
 * 화면이 그 사실을 말한다 — 그래야 관리자가 무엇을 고치는지 안다.
 *
 * 저장은 성공한 척하지 않는다. 공지를 올린 줄 알고 닫으면 아무도 그 공지를
 * 못 본 채로 남는다.
 */

type Tab = 'notice' | 'faq' | 'survey'

const TABS: { id: Tab; label: string }[] = [
  { id: 'notice', label: '공지사항' },
  { id: 'faq', label: 'Q&A' },
  { id: 'survey', label: '설문조사' },
]

export function ContentPage() {
  const [tab, setTab] = useState<Tab>('notice')
  const [title, setTitle] = useState('')
  const [failure, setFailure] = useState<string | null>(null)
  const notices = useRemote(fetchManagedNotices, [])
  const faq = useRemote(fetchManagedFaq, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    void saveNotice({ title, level: 'notice' }).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">콘텐츠 관리</h1>
      {/* 관리자가 무엇을 고치는지 알아야 한다 */}
      <p className="mt-1 text-sm text-slate-600">
        여기 있는 것이 사용자 포털에 그대로 보입니다 — 공지사항 탭과 챗봇의 자주 묻는 질문입니다.
      </p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <AdminTabs label="콘텐츠 종류" items={TABS} value={tab} onChange={setTab} />

      {tab === 'notice' && notices.kind === 'ready' && (
        <section className="mt-4">
          <p className="text-xs text-slate-600">
            {notices.data.length}건 · 사용자 포털 사이드바의 <b>공지사항</b>에 그대로 나옵니다
          </p>
          <AdminTable label="공지사항 목록" minW="min-w-[38rem]">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">등급</th>
                  <th scope="col" className="px-3 py-2">제목</th>
                  <th scope="col" className="px-3 py-2">게시일</th>
                </tr>
              </thead>
              <tbody>
            {notices.data.length === 0 && (
              <EmptyRow cols={3}>등록된 공지사항이 없습니다.</EmptyRow>
            )}
                {notices.data.map((n) => (
                  <tr key={n.id} className="border-t border-slate-100">
                    <th scope="row" className="px-3 py-2 text-left">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          n.level === 'important'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {noticeLevelLabel(n.level)}
                      </span>
                    </th>
                    <td className="px-3 py-2 font-bold text-slate-800">{n.title}</td>
                    <td className="px-3 py-2 tabular-nums text-slate-600">{n.postedOn}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>

          <form onSubmit={submit} className="mt-4 max-w-xl rounded-xl border border-slate-200 bg-white p-4">
            <label htmlFor="notice-title" className="block text-[11px] font-bold text-slate-500">
              새 공지 제목
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                id="notice-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 4월 정기 점검 안내"
                className="min-h-11 min-w-48 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <Button tone="primary" type="submit" disabled={title.trim() === ''}>
                등록
              </Button>
            </div>
          </form>
        </section>
      )}

      {tab === 'faq' && faq.kind === 'ready' && (
        <section className="mt-4">
          <p className="text-xs text-slate-600">
            {faq.data.length}건 · 챗봇 화면 아래 <b>자주 묻는 질문</b>에 그대로 나옵니다
          </p>
          <ul className="mt-2 space-y-2">
            {faq.data.map((f) => (
              <li
                key={f.question}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3"
              >
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {faqCategoryLabel(f.category)}
                </span>
                <span className="text-sm text-slate-800">{f.question}</span>
              </li>
            ))}
          </ul>
          {/* 목록에 있다고 다 답할 수 있는 건 아니다 */}
          <p className="mt-3 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            질문을 목록에 넣는다고 챗봇이 답할 수 있게 되지는 않습니다. 지식베이스에 근거가 없으면
            챗봇은 모른다고 답합니다 — 보안 항목이 지금 그렇습니다.
          </p>
        </section>
      )}

      {tab === 'survey' && (
        <section className="mt-4 max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-black text-slate-900">만족도 설문</p>
          <p className="mt-2 text-sm text-slate-700">
            설문 발송과 결과 집계는 <b>서비스 분석 &gt; 이용만족도</b>에서 다룹니다. 같은 것을 두
            화면에 두면 어느 쪽이 진짜인지 알 수 없게 되므로 여기서는 만들지 않았습니다.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            설문 문항을 직접 만드는 기능은 아직 없습니다. 지금은 5점 척도와 자유 의견 한 칸으로
            고정돼 있습니다.
          </p>
        </section>
      )}
    </main>
  )
}
