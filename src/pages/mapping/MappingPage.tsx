import {
  type MappingMode,
  byStatus,
  countByStatus,
  mappingModeDesc,
  mappingModeLabel,
  mappingStatusLabel,
  projectedRate,
  standardizedRate,
  unsolvableCount,
  type AddressResolution,
  type BatchAddressResult,
  type CodeLookupResult,
  type MappingStatus,
  type OcrAddressResult,
  type SingleAddressResult,
  type TagMappingResult,
} from "@entities/mapping/model";
import { useMapping, type MappingOptions } from "@features/mapping/useMapping";
import { formatCount } from "@shared/lib/format";
import { AgentPageHeader } from "@widgets/agent-shell/AgentShell";
import { AgentFlowTrail } from "@widgets/agent-flow/AgentFlowTrail";
import { Play } from "lucide-react";
import { Button } from '@shared/ui/Button'

const STATUS_STYLE: Record<MappingStatus, string> = {
  auto: "bg-emerald-100 text-emerald-800",
  review: "bg-amber-100 text-amber-800",
  none: "bg-slate-200 text-slate-700",
};

const FILTERS: { value: MappingStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "auto", label: "자동 확정 가능" },
  { value: "review", label: "사람 확인 필요" },
  { value: "none", label: "표준화 불가" },
];

export function MappingPage({
  onBack,
  apiOptions,
}: {
  onBack?: () => void;
  apiOptions?: MappingOptions;
}) {
  const m = useMapping(apiOptions ?? {});
  const busy = m.phase.kind === "running";
  const runLabel =
    m.mode === "tags"
      ? "태그·코드 매핑 분석"
      : m.mode === "code-lookup"
        ? "코드 조회"
        : "주소 표준화";

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <AgentPageHeader
          agentId="address"
          title="기준정보 표준화 에이전트"
          desc={
            <>
              업무 식별자와 소재지를 표준 체계로 맞추고, 어디까지가 자동이고
              어디부터 사람이 판단할지 나눕니다. 무엇을 표준화하는지는
              발주처마다 다릅니다.
            </>
          }
          onBack={onBack}
        />

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-black text-slate-900">
              1 · 처리 유형
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {m.config.modes.map((v) => (
                <label
                  key={v}
                  className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand-soft"
                >
                  <input
                    type="radio"
                    name="mapping-mode"
                    value={v}
                    checked={m.mode === v}
                    onChange={() => m.setMode(v)}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800">
                      {mappingModeLabel(v)}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {mappingModeDesc(v)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {m.mode && (
            <>
              <ModeInput
                mode={m.mode}
                tagsTargetNote={m.config.tagsTargetNote}
                addressExamples={m.config.addressExamples}
                codeExamples={m.config.codeExamples}
                query={m.query}
                setQuery={m.setQuery}
                batchText={m.batchText}
                setBatchText={m.setBatchText}
                ocrDocument={m.ocrDocument}
              />

              <Button tone="primary" onClick={() => void m.run()} disabled={busy}>
                <Play className="size-4" aria-hidden="true" />
                {busy ? "처리 중…" : runLabel}
              </Button>

              {/* 자리는 처음부터 두고 내용만 채운다 — 실행 순간에 만들어지는 리전은
                  첫 변화를 놓친다. 보이는 카드는 같은 말을 두 번 읽히지 않게 내린다 */}
              <p role="status" aria-live="polite" className="sr-only">
                {busy ? "표준 체계와 대조하고 있습니다" : ""}
              </p>

              {busy && (
                <div
                  aria-hidden="true"
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-sm font-bold text-slate-700">
                    표준 체계와 대조하고 있습니다…
                  </p>
                  <div className="mt-3 space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-3 animate-pulse rounded bg-slate-100"
                      />
                    ))}
                  </div>
                </div>
              )}

              {m.phase.kind === "failed" && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-5"
                >
                  <p className="text-sm font-bold text-rose-800">
                    처리하지 못했습니다
                  </p>
                  <p className="mt-1 text-sm text-rose-700">
                    {m.phase.message}
                  </p>
                </div>
              )}

              {m.phase.kind === "done" && m.phase.result.mode === "tags" && (
                <TagResultView
                  result={m.phase.result}
                  filter={m.filter}
                  setFilter={m.setFilter}
                  applied={m.applied}
                  applyAuto={m.applyAuto}
                  expanded={m.expanded}
                  toggleExpand={m.toggleExpand}
                />
              )}
              {m.phase.kind === "done" &&
                m.phase.result.mode === "address-single" && (
                  <SingleResultView result={m.phase.result} />
                )}
              {m.phase.kind === "done" &&
                m.phase.result.mode === "address-batch" && (
                  <BatchResultView result={m.phase.result} />
                )}
              {m.phase.kind === "done" &&
                m.phase.result.mode === "address-ocr" && (
                  <OcrResultView result={m.phase.result} />
                )}
              {m.phase.kind === "done" &&
                m.phase.result.mode === "code-lookup" && (
                  <CodeResultView result={m.phase.result} />
                )}
            </>
          )}

          <AgentFlowTrail agentId="address" />
        </div>
      </div>
    </main>
  );
}

/* 부모 안에서 정의하지 않는다 — 매 렌더 새 타입이 되어 리마운트되고,
   입력창이라면 첫 글자만 입력된다(AGENTS.md §6) */
function ModeInput({
  mode,
  tagsTargetNote,
  addressExamples,
  codeExamples,
  query,
  setQuery,
  batchText,
  setBatchText,
  ocrDocument,
}: {
  mode: MappingMode;
  tagsTargetNote: string | null;
  addressExamples: string[];
  codeExamples: string[];
  query: string;
  setQuery: (v: string) => void;
  batchText: string;
  setBatchText: (v: string) => void;
  ocrDocument: string;
}) {
  if (mode === "tags") {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-black text-slate-900">2 · 대상</h2>
        <p className="mt-2 text-sm text-slate-600">{tagsTargetNote}</p>
      </section>
    );
  }

  if (mode === "address-ocr") {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-black text-slate-900">2 · 대상 문서</h2>
        <p className="mt-2 text-sm font-bold text-slate-800">{ocrDocument}</p>
        <p className="mt-1 text-xs text-slate-500">
          문서에서 주소로 보이는 줄을 뽑아 표준화합니다. OCR 신뢰도가 낮은 줄은
          표준화하지 않습니다.
        </p>
      </section>
    );
  }

  if (mode === "address-batch") {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <label
          htmlFor="batch"
          className="block text-sm font-black text-slate-900"
        >
          2 · 표준화할 목록
        </label>
        <p className="mt-1 text-xs text-slate-500">
          한 줄에 한 건씩 붙여 넣으세요.
        </p>
        <textarea
          id="batch"
          rows={6}
          value={batchText}
          onChange={(e) => setBatchText(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3 font-mono text-xs focus-visible:outline-2 focus-visible:outline-slate-900"
        />
      </section>
    );
  }

  const isCode = mode === "code-lookup";
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <label htmlFor="mapq" className="block text-sm font-black text-slate-900">
        2 · {isCode ? "법정동코드" : "변환할 주소"}
      </label>
      <input
        id="mapq"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isCode ? "예) 4812310300" : "예) 창원본사 공단로 274"}
        className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus-visible:outline-2 focus-visible:outline-slate-900"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {(isCode ? codeExamples : addressExamples).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setQuery(e)}
            className="min-h-11 rounded-full border border-slate-200 px-3 font-mono text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            {e}
          </button>
        ))}
      </div>
    </section>
  );
}

/** 주소 한 건의 판정 — 단일·일괄·OCR이 같은 모양으로 보여 준다 */
function ResolutionBody({ r }: { r: AddressResolution }) {
  return (
    <div className="mt-2 space-y-2">
      {r.roadAddress && (
        <dl className="grid gap-2 sm:grid-cols-2">
          {[
            ["도로명주소", r.roadAddress],
            ["지번주소", r.jibunAddress],
            ["우편번호", r.postalCode],
            ["법정동코드", r.legalCode],
          ].map(([k, v]) =>
            v ? (
              <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-[11px] text-slate-500">{k}</dt>
                <dd className="text-sm font-bold text-slate-900">{v}</dd>
              </div>
            ) : null,
          )}
        </dl>
      )}

      <ul className="space-y-1">
        {r.basis.map((b) => (
          <li key={b.label} className="text-sm text-slate-700">
            <span className="font-bold">{b.label} · </span>
            {b.detail}
          </li>
        ))}
      </ul>

      {r.alternatives.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-600">다른 후보</p>
          <ul className="mt-1 space-y-1">
            {r.alternatives.map((a) => (
              <li key={a.code} className="text-sm text-slate-600">
                <span className="font-mono text-xs">{a.code}</span> · {a.name} —{" "}
                {a.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI가 못 하는 일을 못 한다고 말하는 자리 */}
      {r.blocker && (
        <p className="rounded border border-rose-200 bg-rose-50 px-2.5 py-2 text-sm font-bold text-rose-900">
          {r.blocker}
        </p>
      )}
    </div>
  );
}

function StatusChip({ s }: { s: MappingStatus }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[s]}`}
    >
      {mappingStatusLabel(s)}
    </span>
  );
}

function SingleResultView({ result }: { result: SingleAddressResult }) {
  return (
    <section
      aria-labelledby="addr-single"
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="addr-single" className="text-sm font-black text-slate-900">
          주소 표준화 결과
        </h2>
        <StatusChip s={result.resolved.status} />
        {result.resolved.confidence > 0 && (
          <span className="ml-auto text-xs font-bold text-slate-700">
            {Math.round(result.resolved.confidence * 100)}%
          </span>
        )}
      </div>
      <p className="mt-1 font-mono text-xs text-slate-500">
        입력 · {result.input}
      </p>
      <ResolutionBody r={result.resolved} />
      <p className="mt-4 text-xs text-slate-400">
        자동 확정은 건물까지 특정된 건만입니다. 확인 필요·불가 건은 담당자
        판단이 필요합니다.
      </p>
    </section>
  );
}

function BatchResultView({ result }: { result: BatchAddressResult }) {
  const counts = countByStatus(result.rows);

  return (
    <section
      aria-labelledby="addr-batch"
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 id="addr-batch" className="text-sm font-black text-slate-900">
        일괄 표준화 결과 {result.rows.length}건
      </h2>

      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["자동 확정", `${counts.auto}건`],
          ["사람 확인", `${counts.review}건`],
          ["표준화 불가", `${counts.none}건`],
          ["소요", `${result.elapsedSeconds}초`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
            <dt className="text-[11px] text-slate-500">{k}</dt>
            <dd className="text-sm font-black text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>

      {/* 자동으로 끝나는 건수를 먼저 말한다 — 목록을 다 읽기 전에 알아야 하는 숫자다 */}
      {counts.auto < result.rows.length && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
          {result.rows.length}건 중 {counts.review + counts.none}건은 사람이
          봐야 합니다
          {counts.none > 0 &&
            ` (그중 ${counts.none}건은 AI로 해결되지 않습니다)`}
          .
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {result.rows.map((row) => (
          <li key={row.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip s={row.resolved.status} />
              <span className="font-mono text-xs text-slate-600">
                {row.input}
              </span>
            </div>
            {row.resolved.roadAddress ? (
              <p className="mt-1 text-sm font-bold text-slate-800">
                → {row.resolved.roadAddress}
              </p>
            ) : (
              <p className="mt-1 text-sm font-bold text-rose-800">
                → {row.resolved.blocker}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OcrResultView({ result }: { result: OcrAddressResult }) {
  const counts = countByStatus(result.candidates);

  return (
    <section
      aria-labelledby="addr-ocr"
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 id="addr-ocr" className="text-sm font-black text-slate-900">
        문서에서 뽑은 주소 {result.candidates.length}건
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        {result.documentName} · 소요 {result.elapsedSeconds}초
      </p>

      {counts.none > 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
          {counts.none}건은 OCR 신뢰도가 낮아 표준화하지 않았습니다. 잘못 읽은
          글자로 만든 정상 주소가 가장 위험합니다.
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {result.candidates.map((c) => (
          <li key={c.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip s={c.resolved.status} />
              <span className="text-[11px] text-slate-500">
                {c.lineNo}번째 줄
              </span>
              <span
                className={`ml-auto text-[11px] font-bold ${
                  c.ocrConfidence < 0.85 ? "text-amber-700" : "text-slate-400"
                }`}
              >
                OCR {Math.round(c.ocrConfidence * 100)}%
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-600">{c.text}</p>
            <ResolutionBody r={c.resolved} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CodeResultView({ result }: { result: CodeLookupResult }) {
  return (
    <section
      aria-labelledby="code-lookup"
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="code-lookup" className="text-sm font-black text-slate-900">
          코드 역조회 결과
        </h2>
        <StatusChip s={result.status} />
        <span className="ml-auto font-mono text-xs text-slate-500">
          {result.code}
        </span>
      </div>

      {result.found ? (
        <>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["도로명주소", result.found.roadAddress],
              ["지번주소", result.found.jibunAddress],
              ["법정동코드", result.found.legalCode],
              ["상태", result.found.note],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-[11px] text-slate-500">{k}</dt>
                <dd className="text-sm font-bold text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          {/* 조회는 됐지만 그대로 쓰면 안 되는 경우 */}
          {result.found.supersededBy && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
              폐지된 코드입니다. 현행 코드 {result.found.supersededBy}로 갱신한
              뒤 사용하십시오.
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-900">
          {result.blocker}
        </p>
      )}
    </section>
  );
}

function TagResultView({
  result,
  filter,
  setFilter,
  applied,
  applyAuto,
  expanded,
  toggleExpand,
}: {
  result: TagMappingResult;
  filter: MappingStatus | "all";
  setFilter: (f: MappingStatus | "all") => void;
  applied: Set<string>;
  applyAuto: () => void;
  expanded: string | null;
  toggleExpand: (id: string) => void;
}) {
  const autoList = byStatus(result, "auto");
  const shown = filter === "all" ? result.candidates : byStatus(result, filter);
  const unmatched = result.totalTags - result.standardized;
  const unsolvable = unsolvableCount(result);

  return (
    <>
      <section
        aria-labelledby="map-summary"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 id="map-summary" className="text-sm font-black text-slate-900">
          표준화 현황
        </h2>

        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["수집 태그", `${formatCount(result.totalTags)}개`],
            ["표준화", `${Math.round(standardizedRate(result) * 100)}%`],
            ["미매칭", `${formatCount(unmatched)}개`],
            ["소요", `${result.elapsedSeconds}초`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-[11px] text-slate-500">{k}</dt>
              <dd className="text-sm font-black text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-600">표준 명명규칙</p>
          <p className="mt-1 font-mono text-sm text-slate-800">
            {result.namingPattern}
          </p>
          <p className="mt-0.5 font-mono text-xs text-slate-500">
            예) {result.namingExample}
          </p>
        </div>

        {/* AI로 해결되는 것과 아닌 것을 섞으면 계획이 어긋난다 */}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-bold text-amber-900">
            미매칭 {formatCount(unmatched)}개 중 {formatCount(unsolvable)}개는
            AI로 해결되지 않습니다.
          </p>
          <p className="mt-1 text-sm text-amber-900">
            설비·시스템 조치가 선행돼야 하며, 그 전까지 표준화율은{" "}
            {Math.round(
              ((result.totalTags - unsolvable) / result.totalTags) * 100,
            )}
            %가 상한입니다.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="map-reasons"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 id="map-reasons" className="text-sm font-black text-slate-900">
          미매칭 사유
        </h2>
        <div className="mt-3 overflow-x-auto" role="region" aria-label="표 — 가로로 스크롤됩니다" tabIndex={0}>
          <table className="w-full min-w-[28rem] text-sm">
            <caption className="sr-only">미매칭 사유</caption>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th scope="col" className="py-2 pr-3 font-bold">
                  사유
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  건수
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  AI 처리
                </th>
                <th scope="col" className="py-2 font-bold">
                  필요한 조치
                </th>
              </tr>
            </thead>
            <tbody>
              {result.reasons.map((r) => (
                <tr
                  key={r.label}
                  className="border-b border-slate-100 last:border-0"
                >
                  <th scope="row" className="py-2 pr-3 text-slate-700 text-left">{r.label}</th>
                  <td className="py-2 pr-3 tabular-nums text-slate-700">
                    {formatCount(r.count)}
                  </td>
                  {/* 색이 아니라 글자로 구분한다 */}
                  <td
                    className={`py-2 pr-3 font-bold ${r.aiSolvable ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {r.aiSolvable ? "가능" : "불가"}
                  </td>
                  <td className="py-2 text-slate-600">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="map-candidates"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="map-candidates" className="text-sm font-black text-slate-900">
            매핑 후보
          </h2>
          {/* 목록은 전체가 아니라 예시다 — 7행으로 4,820개를 대표한다고 오해하면 안 된다 */}
          <span className="text-xs text-slate-500">
            예시 {result.candidates.length}건 (자동 {autoList.length} · 확인{" "}
            {byStatus(result, "review").length} · 불가{" "}
            {byStatus(result, "none").length})
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`min-h-11 rounded-full border px-3 text-xs font-bold ${
                filter === f.value
                  ? "border-brand bg-brand text-brand-fg"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={applyAuto} disabled={applied.size > 0 || autoList.length === 0}>
            자동 확정 {formatCount(result.autoConfirmable)}건 반영
          </Button>
          {applied.size > 0 && (
            <p className="text-sm font-bold text-emerald-700">
              {formatCount(result.autoConfirmable)}건 반영 — 표준화{" "}
              {Math.round(standardizedRate(result) * 100)}% →{" "}
              {Math.round(projectedRate(result, result.autoConfirmable) * 100)}%
            </p>
          )}
        </div>

        <ul className="mt-4 space-y-2">
          {shown.map((c) => {
            const isApplied = applied.has(c.id);
            const open = expanded === c.id;
            return (
              <li key={c.id} className="rounded-lg border border-slate-200">
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <StatusChip s={c.status} />
                  <span className="font-mono text-xs text-slate-600">
                    {c.source}
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {c.suggested}
                  </span>
                  {c.confidence > 0 && (
                    <span className="text-[11px] text-slate-500">
                      {Math.round(c.confidence * 100)}%
                    </span>
                  )}
                  {isApplied && (
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      반영됨
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleExpand(c.id)}
                    aria-expanded={open}
                    className="ml-auto min-h-11 text-xs font-bold text-slate-500 hover:text-slate-900"
                  >
                    {open ? "근거 닫기" : "근거 보기"}
                  </button>
                </div>

                {open && (
                  <div className="border-t border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs text-slate-600">
                      {c.sourceSystem} · {c.standardName}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {c.basis.map((b) => (
                        <li key={b.label} className="text-sm text-slate-700">
                          <span className="font-bold">{b.label} · </span>
                          {b.detail}
                        </li>
                      ))}
                    </ul>

                    {c.alternatives.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-slate-600">
                          다른 후보
                        </p>
                        <ul className="mt-1 space-y-1">
                          {c.alternatives.map((a) => (
                            <li key={a.code} className="text-sm text-slate-600">
                              <span className="font-mono text-xs">
                                {a.code}
                              </span>{" "}
                              · {a.name} ({Math.round(a.confidence * 100)}%) —{" "}
                              {a.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI가 못 하는 일을 못 한다고 말하는 자리 */}
                    {c.blocker && (
                      <p className="mt-3 rounded border border-rose-200 bg-rose-50 px-2.5 py-2 text-sm font-bold text-rose-900">
                        {c.blocker}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-xs text-slate-400">
          자동 확정은 신뢰도가 높은 건만 반영됩니다. 확인 필요·불가 건은 담당자
          판단이 필요합니다.
        </p>
      </section>
    </>
  );
}
