import {
  SIMILARITY_STEPS,
  matchRatio,
  mismatches,
  type KnowledgeResult,
} from '@entities/knowledge/model'
import { useKnowledge, type KnowledgeOptions } from '@features/knowledge/useKnowledge'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'
import { formatCount } from '@shared/lib/format'

export function KnowledgePage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: KnowledgeOptions }) {
  const k = useKnowledge(apiOptions ?? {})

  return (
    <AgentShell<KnowledgeResult>
      title="지식 검색 에이전트"
      desc="축적 도면에서 유사 사례를 찾고, 어느 속성이 닮았고 어디가 다른지 보여 줍니다."
      onBack={onBack}
      phase={k.phase}
      docs={k.docs}
      documentId={k.documentId}
      onSelectDocument={k.setDocumentId}
      docSectionLabel="검색 기준 문서"
      emptyDocsLabel="검색 기준이 될 문서가 없습니다."
      optionsLabel="검색 조건"
      runLabel="유사 도면 검색"
      runningLabel="검색 중…"
      runningMessage="도면 온톨로지에서 유사 사례를 찾고 있습니다…"
      onRun={() => void k.run()}
      onReset={k.reset}
      options={
        <div>
          <label htmlFor="min-sim" className="block text-xs font-bold text-slate-600">
            최소 유사도
          </label>
          <select
            id="min-sim"
            value={k.minSimilarity}
            onChange={(e) => k.setMinSimilarity(Number(e.target.value) as (typeof SIMILARITY_STEPS)[number])}
            className="mt-1 min-h-11 rounded-lg border border-slate-200 px-3 text-sm"
          >
            {SIMILARITY_STEPS.map((s) => (
              <option key={s} value={s}>
                {Math.round(s * 100)}% 이상
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">기준을 올리면 후보가 줄어듭니다.</p>
        </div>
      }
      result={(res) => (
        <ResultSection
          id="knowledge-result"
          title={`유사 도면 ${res.hits.length}건`}
          stats={[
            ['색인 도면', `${formatCount(res.indexedCount)}장`],
            ['최고 유사도', res.hits[0] ? `${Math.round(res.hits[0].similarity * 100)}%` : '-'],
            ['검색 결과', `${res.hits.length}건`],
            ['소요', `${res.elapsedSeconds}초`],
          ]}
          notice="AI가 찾은 유사 사례입니다. 적용 전 설계 담당자 검토가 필요합니다."
        >
          {res.hits.length === 0 ? (
            <p className="text-sm text-slate-600">
              기준 유사도를 넘는 도면이 없습니다. 기준을 낮춰 다시 검색해 보세요.
            </p>
          ) : (
            <ul className="space-y-4">
              {res.hits.map((h) => (
                <li key={h.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{h.code}</span>
                    <span className="text-sm text-slate-600">{h.name}</span>
                    <span className="text-xs text-slate-400">{h.year}</span>
                    <span className="ml-auto text-sm font-black text-slate-900">
                      {Math.round(h.similarity * 100)}%
                    </span>
                  </div>

                  {/* 유사도 점수의 근거 — 어느 속성이 맞고 틀렸는지 */}
                  <p className="mt-1 text-xs text-slate-500">
                    속성 {h.attributes.filter((a) => a.matched).length}/{h.attributes.length} 일치 (
                    {Math.round(matchRatio(h) * 100)}%)
                  </p>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[24rem] text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th scope="col" className="py-1.5 pr-3 font-bold">속성</th>
                          <th scope="col" className="py-1.5 pr-3 font-bold">신규 사양</th>
                          <th scope="col" className="py-1.5 pr-3 font-bold">후보 도면</th>
                          <th scope="col" className="py-1.5 font-bold">일치</th>
                        </tr>
                      </thead>
                      <tbody>
                        {h.attributes.map((a) => (
                          <tr key={a.label} className="border-b border-slate-100 last:border-0">
                            <td className="py-1.5 pr-3 text-slate-600">{a.label}</td>
                            <td className="py-1.5 pr-3 text-slate-700">{a.queryValue}</td>
                            <td className={`py-1.5 pr-3 ${a.matched ? 'text-slate-700' : 'font-bold text-amber-700'}`}>
                              {a.candidateValue}
                            </td>
                            {/* 색만으로 구분하지 않는다 — 기호를 함께 쓴다 */}
                            <td className={a.matched ? 'py-1.5 text-emerald-700' : 'py-1.5 font-bold text-amber-700'}>
                              {a.matched ? '일치' : '다름'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {mismatches(h).length > 0 && (
                    <p className="mt-2 rounded bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900">
                      확인 필요 · {mismatches(h).map((m) => m.label).join(', ')}
                    </p>
                  )}

                  {h.reusable.length > 0 && (
                    <p className="mt-2 text-xs text-slate-600">
                      <span className="font-bold">재사용 가능 · </span>
                      {h.reusable.join(' / ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ResultSection>
      )}
    />
  )
}
