import { useState } from 'react'
import { BookOpen, PlugZap, X } from 'lucide-react'
import {
  SECURITY_LABEL,
  hasGap,
  missing,
  type KnowledgeArea,
} from '@entities/knowledgebase/model'
import { TOOL_KIND_LABEL, type ToolEntry } from '@entities/packops/model'
import { fetchAreas } from '@shared/api/knowledgebase'
import { fetchTools } from '@shared/api/packops'
import { useRemote } from '@features/remote/useRemote'

/**
 * 대화 오른쪽 패널 — 이 대화가 무엇을 근거로 답하는가.
 *
 * 이전 데모에도 같은 자리에 'RAG 연동 문서' 패널이 있었다. 그 패널은 문서 목록만
 * 보여 줬는데, **목록에 있다고 답할 수 있는 것은 아니다.** 색인이 안 됐거나 실패한
 * 문서는 사용자에게 '없다'고 답하고, 사용자는 그걸 구분할 방법이 없다.
 *
 * 그래서 여기서는 **찾을 수 있는 건수**를 먼저 세고, 등록됐는데 못 찾는 것이 있으면
 * 그 자리에서 말한다. 관리자의 지식 관리 화면과 같은 데이터를 같은 기준으로 본다.
 *
 * 도구 탭도 같은 이유다 — 끊긴 도구가 있으면 어떤 일을 지금 못 하는지 미리 말한다.
 * 눌러 보고 나서 안 되는 것보다 낫다.
 */

const SECURITY_TONE: Record<KnowledgeArea['security'], string> = {
  confidential: 'bg-rose-100 text-rose-800',
  internal: 'bg-amber-100 text-amber-900',
  public: 'bg-emerald-100 text-emerald-800',
}

type PanelTab = 'knowledge' | 'tools'

function KnowledgeList() {
  const state = useRemote(fetchAreas, [])

  if (state.kind === 'loading') {
    return (
      <div role="status" className="space-y-2 p-3">
        <span className="sr-only">지식 영역을 불러오는 중입니다</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-white" />
        ))}
      </div>
    )
  }
  if (state.kind === 'error') {
    return (
      <p role="alert" className="p-3 text-xs text-rose-800">
        {state.message}
      </p>
    )
  }

  const areas = state.data
  const searchable = areas.reduce((n, a) => n + a.searchable, 0)
  const gaps = areas.filter(hasGap)

  return (
    <div className="p-3">
      <p className="text-[11px] text-slate-500">
        지금 답변 근거로 쓸 수 있는 문서 <b className="text-slate-800">{searchable}건</b>
      </p>
      {/* 등록 건수만 보면 다 찾을 수 있다고 믿게 된다 */}
      {gaps.length > 0 && (
        <p className="mt-1 text-[11px] font-bold text-amber-800">
          등록됐지만 못 찾는 문서가 있는 영역 {gaps.length}개 — 그 문서는 없다고 답합니다.
        </p>
      )}
      <ul className="mt-3 space-y-2">
        {areas.map((a) => (
          <li key={a.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start gap-2">
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${SECURITY_TONE[a.security]}`}
              >
                {SECURITY_LABEL[a.security]}
              </span>
              <span className="min-w-0 flex-1 text-xs font-bold text-slate-900">{a.name}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              찾을 수 있는 문서 {a.searchable.toLocaleString()}건
              {a.registered !== a.searchable && ` / 등록 ${a.registered.toLocaleString()}건`}
            </p>
            {missing(a) > 0 && (
              <p className="mt-1 text-[11px] font-bold text-amber-800">
                {missing(a)}건은 색인되지 않아 검색에 안 잡힙니다
              </p>
            )}
            {a.staleCount > 0 && (
              <p className="mt-0.5 text-[11px] text-amber-800">
                {a.staleCount}건은 색인 뒤에 바뀌어 옛 내용으로 답합니다
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ToolList() {
  const state = useRemote(fetchTools, [])

  if (state.kind === 'loading') {
    return (
      <div role="status" className="space-y-2 p-3">
        <span className="sr-only">연동 도구를 불러오는 중입니다</span>
        {[0, 1].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg border border-slate-200 bg-white" />
        ))}
      </div>
    )
  }
  if (state.kind === 'error') {
    return (
      <p role="alert" className="p-3 text-xs text-rose-800">
        {state.message}
      </p>
    )
  }

  const tools: ToolEntry[] = state.data
  const down = tools.filter((t) => !t.connected)

  return (
    <div className="p-3">
      {/* 끊긴 도구는 조용히 실패한다 — 미리 말한다 */}
      {down.length > 0 ? (
        <p className="text-[11px] font-bold text-rose-800">
          끊긴 도구 {down.length}개 — 이 도구를 쓰는 업무는 지금 못 합니다.
        </p>
      ) : (
        <p className="text-[11px] text-slate-500">연결이 끊긴 도구는 없습니다.</p>
      )}
      <ul className="mt-3 space-y-2">
        {tools.map((t) => (
          <li
            key={t.id}
            className={`rounded-lg border p-3 ${
              t.connected ? 'border-slate-200 bg-white' : 'border-rose-200 bg-rose-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`size-2 shrink-0 rounded-full ${t.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
                {t.name}
              </span>
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                {TOOL_KIND_LABEL[t.kind]}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {t.connected ? '연결됨' : '끊김'} · {t.usedBy.join(', ')}
            </p>
            {t.downReason && (
              <p className="mt-1 text-[11px] font-bold text-rose-800">{t.downReason}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const TABS: { id: PanelTab; label: string; Icon: typeof BookOpen }[] = [
  { id: 'knowledge', label: '지식 영역', Icon: BookOpen },
  { id: 'tools', label: '연동 도구', Icon: PlugZap },
]

export function ChatSidePanel({ onClose }: { onClose?: (() => void) | undefined }) {
  const [tab, setTab] = useState<PanelTab>('knowledge')

  return (
    <aside
      aria-label="답변 근거"
      className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-slate-50"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3">
        <BookOpen className="text-brand size-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm font-black text-slate-900">답변 근거</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="답변 근거 닫기"
            className="flex min-h-11 items-center rounded-lg px-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="border-b border-slate-200 bg-white px-3 pb-3">
        <ul className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {TABS.map(({ id, label, Icon }) => {
            const on = tab === id
            return (
              <li key={id} className="flex-1">
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={on ? 'true' : undefined}
                  className={`flex min-h-11 w-full items-center justify-center gap-1 rounded-lg text-[11px] font-bold ${
                    on ? 'bg-brand text-brand-fg shadow-sm' : 'text-slate-500 hover:bg-white'
                  }`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {tab === 'knowledge' ? <KnowledgeList /> : <ToolList />}
    </aside>
  )
}
