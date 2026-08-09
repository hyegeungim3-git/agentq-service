import { useState } from 'react'
import { MODEL_STATE_LABEL, type ModelEntry } from '@entities/llmops/model'
import { fetchModels, updateModelParams } from '@shared/api/llmops'
import { useRemote } from '@features/remote/useRemote'
import { Button } from '@shared/ui/Button'

/**
 * LLM 설정.
 *
 * **중지된 모델은 왜 껐는지 남긴다.** 이유가 없으면 다시 켜도 되는지 아무도 모르고,
 * 결국 아무도 안 건드린 채 남는다.
 *
 * 파라미터 변경은 성공한 척하지 않는다. 온도를 바꾸는 것은 서비스 전체의 답변을
 * 바꾸는 일이다 — 바꾼 줄 알고 닫는데 실제 답변이 그대로면 가장 위험하다.
 */

function Detail({
  model,
  onSave,
}: {
  model: ModelEntry
  onSave: (id: string, temperature: number) => void
}) {
  const [temp, setTemp] = useState(model.temperature)
  const changed = temp !== model.temperature

  return (
    <section aria-labelledby="model-detail" className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="model-detail" className="text-sm font-black text-slate-900">
          {model.name}
        </h2>
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
            model.state === 'running' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {MODEL_STATE_LABEL[model.state]}
        </span>
        <span className="text-xs text-slate-500">{model.version}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">기반 · {model.base}</p>
      <p className="mt-2 text-sm text-slate-700">{model.purpose}</p>

      {/* 껐으면 왜 껐는지 — 없으면 다시 켜도 되는지 아무도 모른다 */}
      {model.stoppedReason && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          중지 사유 · {model.stoppedReason}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-[11px] font-bold text-slate-500">컨텍스트</dt>
          <dd className="text-sm font-black text-slate-900">
            {(model.contextTokens / 1000).toLocaleString('ko-KR')}K
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-[11px] font-bold text-slate-500">프롬프트 버전</dt>
          <dd className="text-sm font-black text-slate-900">{model.promptVersions}건</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-[11px] font-bold text-slate-500">쓰는 업무</dt>
          <dd className="text-sm font-black text-slate-900">{model.usedBy.length}개</dd>
        </div>
      </dl>

      {/* 어디에 쓰이는지 모르면 껐을 때 무엇이 멈추는지 알 수 없다 */}
      <div className="mt-3">
        <p className="text-[11px] font-bold text-slate-500">이 모델을 쓰는 업무</p>
        {model.usedBy.length === 0 ? (
          <p className="mt-1 text-xs text-slate-400">없습니다 — 지금 이 모델로 나가는 답변은 없습니다.</p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {model.usedBy.map((u) => (
              <li key={u} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                {u}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <label htmlFor="temp" className="block text-[11px] font-bold text-slate-500">
          온도 (temperature) · 현재 {model.temperature}
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input
            id="temp"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="min-w-48 flex-1"
          />
          <output className="w-10 text-sm font-black tabular-nums text-slate-900">{temp.toFixed(1)}</output>
          <Button tone="primary" size="sm" disabled={!changed} onClick={() => onSave(model.id, temp)}>
            저장
          </Button>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          온도를 올리면 표현이 다양해지고 같은 질문에 매번 다른 답이 나옵니다. 규정·수치를 다루는
          업무에서는 낮게 둡니다.
        </p>
      </div>
    </section>
  )
}

export function ModelPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const state = useRemote(fetchModels, [])

  const save = (id: string, temperature: number) => {
    void updateModelParams(id, { temperature }).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">LLM 설정</h1>
      <p className="mt-1 text-sm text-slate-600">등록된 모델과 각 모델이 맡은 업무입니다.</p>

      {failure && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {failure}
        </p>
      )}

      {state.kind === 'loading' && (
        <div role="status" className="mt-4 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
          <span className="sr-only">모델 목록을 불러오는 중입니다</span>
        </div>
      )}

      {state.kind === 'ready' &&
        (() => {
          const running = state.data.filter((m) => m.state === 'running')
          const selected = state.data.find((m) => m.id === selectedId) ?? null
          return (
            <>
              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">등록</dt>
                  <dd className="text-xl font-black text-slate-900">{state.data.length}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">가동 중</dt>
                  <dd className="text-xl font-black text-slate-900">{running.length}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <dt className="text-[11px] font-bold text-slate-500">중지됨</dt>
                  <dd className="text-xl font-black text-slate-900">
                    {state.data.length - running.length}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-4 lg:grid-cols-[20rem_1fr]">
                <ul className="space-y-2">
                  {state.data.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(m.id)}
                        aria-pressed={m.id === selectedId}
                        className={`w-full rounded-xl border p-3 text-left ${
                          m.id === selectedId
                            ? 'border-slate-900 bg-white ring-2 ring-slate-900'
                            : 'border-slate-200 bg-white hover:border-slate-400'
                        }`}
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{m.name}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              m.state === 'running'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {MODEL_STATE_LABEL[m.state]}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">{m.version}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {selected ? (
                  <Detail key={selected.id} model={selected} onSave={save} />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-sm text-slate-500">
                      왼쪽에서 모델을 고르면 맡은 업무와 설정을 봅니다.
                    </p>
                  </div>
                )}
              </div>
            </>
          )
        })()}
    </main>
  )
}
