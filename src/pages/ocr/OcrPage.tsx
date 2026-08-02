import {
  LOW_CONFIDENCE,
  averageConfidence,
  lowConfidenceLines,
  piiLabel,
  type OcrResult,
} from '@entities/ocr/model'
import { useOcr, type OcrOptions } from '@features/ocr/useOcr'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

export function OcrPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: OcrOptions }) {
  const o = useOcr(apiOptions ?? {})

  return (
    <AgentShell<OcrResult>
      title="문서 인식(OCR) 에이전트"
      desc="스캔 문서를 텍스트로 변환하고, 못 읽은 줄과 가린 개인정보를 함께 보여 줍니다."
      onBack={onBack}
      phase={o.phase}
      docs={o.docs}
      documentId={o.documentId}
      onSelectDocument={o.setDocumentId}
      docSectionLabel="인식할 스캔 문서"
      emptyDocsLabel="인식할 문서가 없습니다."
      optionsLabel="처리 설정"
      runLabel="문서 인식"
      runningLabel="인식 중…"
      runningMessage="스캔본을 텍스트로 변환하고 있습니다…"
      onRun={() => void o.run()}
      onReset={o.reset}
      options={
        <label className="flex min-h-11 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={o.maskPii}
            onChange={(e) => o.setMaskPii(e.target.checked)}
            className="size-4"
          />
          <span className="text-sm font-bold text-slate-800">개인정보 자동 마스킹</span>
          <span className="text-xs text-slate-500">성명·연락처 등을 가립니다</span>
        </label>
      }
      result={(res) => {
        const low = lowConfidenceLines(res.lines)
        return (
          <>
            <ResultSection
              id="ocr-result"
              title="인식 결과"
              stats={[
                ['인식 줄', `${res.lines.length}줄`],
                ['평균 신뢰도', `${Math.round(averageConfidence(res.lines) * 100)}%`],
                ['확인 필요', `${low.length}줄`],
                ['소요', `${res.elapsedSeconds}초`],
              ]}
            >
              {/* 못 읽은 줄을 감추면 잘못된 값이 그대로 흘러간다 */}
              {low.length > 0 && (
                <p className="-mt-1 mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
                  신뢰도 {Math.round(LOW_CONFIDENCE * 100)}% 미만인 줄이 {low.length}개 있습니다. 원본과 대조하십시오.
                </p>
              )}

              <ol className="space-y-1.5">
                {res.lines.map((l) => {
                  const weak = l.confidence < LOW_CONFIDENCE
                  return (
                    <li
                      key={l.index}
                      className={`flex flex-wrap items-baseline gap-2 rounded px-2 py-1.5 text-sm ${
                        weak ? 'bg-amber-50' : ''
                      }`}
                    >
                      <span className="w-6 shrink-0 text-[11px] text-slate-400">{l.index + 1}</span>
                      <span className="min-w-0 flex-1 text-slate-800">{l.text}</span>
                      <span className={`text-[11px] ${weak ? 'font-bold text-amber-700' : 'text-slate-400'}`}>
                        {Math.round(l.confidence * 100)}%{weak ? ' · 확인 필요' : ''}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </ResultSection>

            <ResultSection
              id="ocr-mask"
              title="개인정보 마스킹"
              notice="AI가 인식한 결과입니다. 수치는 원본과 대조해 확인하십시오."
            >
              {res.masks.length === 0 ? (
                <p className="text-sm text-slate-600">
                  마스킹을 적용하지 않았습니다. 원문에 개인정보가 그대로 남아 있으니 외부 공유에 주의하십시오.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {res.masks.map((m, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">
                        {piiLabel(m.kind)}
                      </span>
                      <span className="text-slate-500 line-through">{m.original}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-slate-800">{m.masked}</span>
                      <span className="ml-auto text-[11px] text-slate-400">{m.lineIndex + 1}번째 줄</span>
                    </li>
                  ))}
                </ul>
              )}
            </ResultSection>
          </>
        )
      }}
    />
  )
}
