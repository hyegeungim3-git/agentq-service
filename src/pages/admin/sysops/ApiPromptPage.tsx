import { useState } from 'react'
import { API_STATE_LABEL, type ApiState } from '@entities/sysops/model'
import { fetchApis, fetchPrompts, reissueApiKey } from '@shared/api/sysops'
import { useRemote } from '@features/remote/useRemote'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'

/**
 * API · 프롬프트 관리.
 *
 * ⚠️ **키는 화면에 없다.** 이전 데모에는 '키 재발급' 버튼만 있었지만, 키를 목록에
 * 늘어놓는 관리 화면은 흔하고 위험하다 — 화면을 여는 사람 모두가 모든 키를 갖게 되고,
 * 목록에 있으면 언젠가 캡처되고 공유된다. 발급 순간 한 번만 보여 주는 것이 맞다.
 * 화면이 그 방침을 적어 둔다.
 *
 * 프롬프트는 **바꿨을 때 무엇이 달라지는지**를 함께 적는다. 버전 번호만 보면
 * 고쳐도 되는 것처럼 보이는데, 근거 없는 답을 막는 규칙이 거기 들어 있다.
 */

type Tab = 'api' | 'prompt'

const STATE_TONE: Record<ApiState, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  beta: 'bg-amber-100 text-amber-900',
  stopped: 'bg-slate-100 text-slate-600',
}

export function ApiPromptPage() {
  const [tab, setTab] = useState<Tab>('api')
  const [failure, setFailure] = useState<string | null>(null)
  const apis = useRemote(fetchApis, [])
  const prompts = useRemote(fetchPrompts, [])

  const reissue = (id: string) => {
    void reissueApiKey(id).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">API·프롬프트</h1>
      <p className="mt-1 text-sm text-slate-600">외부에 열어 준 API와 에이전트 프롬프트입니다.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      <div role="tablist" aria-label="관리 대상" className="mt-4 flex flex-wrap gap-2">
        {(
          [
            { id: 'api' as const, label: 'API 관리' },
            { id: 'prompt' as const, label: '프롬프트 관리' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
              tab === t.id
                ? 'border-slate-900 bg-brand text-brand-fg'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'api' && apis.kind === 'ready' && (
        <section className="mt-4">
          {/* 키를 왜 안 보여 주는지 목록보다 먼저 */}
          <p className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <b>API 키는 이 화면에 표시하지 않습니다.</b> 발급하는 순간 한 번만 보여 주고 그 뒤로는
            다시 볼 수 없습니다. 목록에 늘어놓으면 이 화면을 여는 사람 모두가 모든 키를 갖게 되고,
            화면은 캡처되고 공유됩니다. 키를 잃어버렸으면 재발급하십시오 — 쓰던 키는 그때 죽습니다.
          </p>

          <AdminTable label="API 목록" minW="min-w-[48rem]" wrap="mt-3">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">API</th>
                  <th scope="col" className="px-3 py-2">경로</th>
                  <th scope="col" className="px-3 py-2">인증</th>
                  <th scope="col" className="px-3 py-2">상태</th>
                  <th scope="col" className="px-3 py-2">오늘 호출</th>
                  <th scope="col" className="px-3 py-2">키</th>
                </tr>
              </thead>
              <tbody>
            {apis.data.length === 0 && (
              <EmptyRow cols={6}>표시할 API 목록이(가) 없습니다.</EmptyRow>
            )}
                {apis.data.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <th scope="row" className="px-3 py-2 text-left">
                      <span className="font-bold text-slate-800">{a.name}</span>
                      <span className="ml-1 text-slate-400">{a.version}</span>
                      {/* 베타·중지는 왜인지 말한다 */}
                      {a.note && <span className="mt-0.5 block text-[11px] text-amber-800">{a.note}</span>}
                    </th>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{a.path}</td>
                    <td className="px-3 py-2 text-slate-600">{a.auth}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${STATE_TONE[a.state]}`}>
                        {API_STATE_LABEL[a.state]}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-600">
                      {a.callsToday.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => reissue(a.id)}
                        className="min-h-11 rounded-lg border border-slate-300 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                      >
                        재발급
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
        </section>
      )}

      {tab === 'prompt' && prompts.kind === 'ready' && (
        <section className="mt-4">
          <p className="text-xs text-slate-600">{prompts.data.length}건</p>
          <ul className="mt-2 space-y-3">
            {prompts.data.map((p) => (
              <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{p.target}</p>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {p.version}
                  </span>
                  <span className="ml-auto text-[11px] text-slate-400">{p.updatedOn}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{p.purpose}</p>
                {/* 버전 번호만 보면 고쳐도 되는 것처럼 보인다 */}
                <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-900">
                  바꾸면 · {p.affects}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-3xl text-xs text-slate-500">
            프롬프트 본문은 여기서 편집하지 않습니다. 편집·검토·되돌리기 흐름은 에이전트 화면(P3)에서
            함께 다룹니다 — 본문만 고칠 수 있게 두면 무엇이 달라졌는지 확인할 방법이 없습니다.
          </p>
        </section>
      )}
    </main>
  )
}
