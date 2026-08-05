import {
  LOW_CONFIDENCE,
  OCR_FORMATS,
  OCR_LANGUAGES,
  OCR_MODES,
  averageConfidence,
  lowConfidenceLines,
  ocrFormatLabel,
  ocrLanguageDesc,
  ocrLanguageLabel,
  ocrModeDesc,
  ocrModeLabel,
  piiLabel,
  type OcrResult,
} from '@entities/ocr/model'
import { useOcr, type OcrOptions } from '@features/ocr/useOcr'
import { AgentShell, ResultSection } from '@widgets/agent-shell/AgentShell'

/* 부모 안에서 정의하지 않는다 — 매 렌더 새 타입이 되어 리마운트된다(AGENTS.md §6) */
function RadioRow<T extends string>({
  name,
  items,
  value,
  onChange,
  label,
  desc,
}: {
  name: string
  items: T[]
  value: T
  onChange: (v: T) => void
  label: (v: T) => string
  desc?: (v: T) => string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((v) => (
        <label
          key={v}
          className="flex min-h-11 flex-1 cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand-soft"
        >
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="mt-0.5 size-4 shrink-0"
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-800">{label(v)}</span>
            {desc && <span className="block text-xs text-slate-500">{desc(v)}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

function CheckRow({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  desc: string
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4"
      />
      <span className="text-sm font-bold text-slate-800">{title}</span>
      <span className="text-xs text-slate-500">{desc}</span>
    </label>
  )
}

export function OcrPage({ onBack, apiOptions }: { onBack?: () => void; apiOptions?: OcrOptions }) {
  const o = useOcr(apiOptions ?? {})

  return (
    <AgentShell<OcrResult>
      title="문서 인식(OCR) 에이전트"
      agentId="ocr"
      desc="스캔 문서를 텍스트로 변환하고, 못 읽은 줄과 가린 개인정보를 함께 보여 줍니다."
      onBack={onBack}
      phase={o.phase}
      docs={o.docs}
      documentId={o.documentId}
      onSelectDocument={o.setDocumentId}
      docSectionLabel="인식할 스캔 문서"
      emptyDocsLabel="인식할 문서가 없습니다."
      upload={o.upload}
      optionsLabel="처리 설정"
      runLabel="문서 인식"
      runningLabel="인식 중…"
      runningMessage="스캔본을 텍스트로 변환하고 있습니다…"
      onRun={() => void o.run()}
      onReset={o.reset}
      options={
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-600">인식 언어</legend>
            <RadioRow
              name="ocr-language"
              items={OCR_LANGUAGES}
              value={o.language}
              onChange={o.setLanguage}
              label={ocrLanguageLabel}
              desc={ocrLanguageDesc}
            />
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-600">문서 처리 모드</legend>
            <RadioRow
              name="ocr-mode"
              items={OCR_MODES}
              value={o.mode}
              onChange={o.setMode}
              label={ocrModeLabel}
              desc={ocrModeDesc}
            />
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-600">결과 형식</legend>
            <RadioRow
              name="ocr-format"
              items={OCR_FORMATS}
              value={o.format}
              onChange={o.setFormat}
              label={ocrFormatLabel}
            />
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-xs font-bold text-slate-600">추가 처리</legend>
            <CheckRow
              checked={o.extractTables}
              onChange={o.setExtractTables}
              title="표 추출"
              desc="항목–값 구조를 표로 뽑습니다"
            />
            <CheckRow
              checked={o.precisionNumbers}
              onChange={o.setPrecisionNumbers}
              title="수치 정밀 인식"
              desc="느려지는 대신 숫자 줄의 신뢰도가 올라갑니다"
            />
            <CheckRow
              checked={o.maskPii}
              onChange={o.setMaskPii}
              title="개인정보 자동 마스킹"
              desc="성명·연락처 등을 가립니다"
            />
          </fieldset>
        </div>
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

              {/* 설정이 결과를 나쁘게 만들었으면 그 이유를 말한다 —
                  신뢰도만 떨어뜨려 놓으면 사용자는 스캔본을 탓한다 */}
              {res.notes.length > 0 && (
                <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold text-slate-600">이번 설정 때문에</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {res.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
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

            {res.table.length > 0 && (
              <ResultSection id="ocr-table" title="추출한 표">
                <div className="overflow-x-auto" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
                  <table className="w-full min-w-[22rem] text-sm">
                    <caption className="sr-only">추출한 표</caption>
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th scope="col" className="py-2 pr-3 font-bold">항목</th>
                        <th scope="col" className="py-2 font-bold">값</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.table.map((r) => (
                        <tr key={r.label} className="border-b border-slate-100 last:border-0">
                          <th scope="row" className="py-2 pr-3 text-slate-600 text-left">{r.label}</th>
                          <td className="py-2 text-slate-800">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ResultSection>
            )}

            {res.specFields.length > 0 && (
              <ResultSection id="ocr-spec" title="규격 대비 판정">
                <ul className="divide-y divide-slate-100">
                  {res.specFields.map((s) => (
                    <li key={s.field} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                      <span className="font-bold text-slate-800">{s.field}</span>
                      <span className="text-slate-700">{s.value}</span>
                      <span className="text-xs text-slate-500">규격 {s.limit}</span>
                      {/* 색이 아니라 글자로 구분한다 */}
                      <span
                        className={`ml-auto text-xs font-bold ${
                          s.withinSpec ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {s.withinSpec ? '규격 내' : '규격 이탈'}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-400">
                  신뢰도가 낮은 줄에서 뽑은 수치는 원본과 대조한 뒤 사용하십시오.
                </p>
              </ResultSection>
            )}

            <ResultSection id="ocr-export" title="내보내기 미리보기">
              <pre className="max-h-72 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                {res.exportText}
              </pre>
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
