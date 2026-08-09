import { useState } from 'react'
import {
  CHECK_STATUS_LABEL,
  canSubmit,
  documentAsText,
  failed,
  fileNameOf,
  runChecks,
  warned,
  type CheckStatus,
  type OutgoingDoc,
} from '@entities/docflow/model'
import { ROLE_LABEL, isComplete, missingRoles } from '@entities/approval/model'
import { fetchApprovalLine, submitApproval } from '@shared/api/approval'
import { useRemote } from '@features/remote/useRemote'
import { useExport } from '@features/export/useExport'
import { Button } from '@shared/ui/Button'

/**
 * 만든 문서를 **점검하고 · 가져가고 · 올린다.**
 *
 * 보고서·회의록·안전관리계획이 각자 다르게 하면 갈라지므로 한 곳에 둔다.
 *
 * 순서가 곧 규율이다 — 점검이 먼저 오고, 고쳐야 할 것이 남아 있으면 결재로 못 간다.
 * 이전 데모는 점검 결과가 미리 적혀 있어 늘 통과였고, 상신은 1.8초 뒤 성공했다.
 * 둘 다 화면 안에서만 벌어지는 일이었다.
 */

const TONE: Record<CheckStatus, string> = {
  pass: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-900',
  fail: 'bg-rose-100 text-rose-800',
}

export function DocActions({ doc }: { doc: OutgoingDoc }) {
  const [open, setOpen] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const line = useRemote(fetchApprovalLine, [])
  const exporter = useExport()

  const checks = runChecks(doc)
  const bad = failed(checks)
  const soft = warned(checks)
  const ready = canSubmit(checks)

  const submit = () => {
    setSent(true)
    void submitApproval(doc.docNo).then((res) => {
      setFailure(res.ok ? null : res.error)
    })
  }

  return (
    <section aria-labelledby="docactions-title" className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <h3 id="docactions-title" className="text-sm font-black text-slate-900">
        내보내기 전 확인
      </h3>

      {/* 비율을 먼저 쓰지 않는다 — 8개 중 6개 통과는 '대체로 괜찮다'로 읽힌다 */}
      <p className="mt-1 text-xs text-slate-600">
        {bad.length > 0 ? (
          <>
            고쳐야 할 것 <b className="text-rose-800">{bad.length}건</b>
            {soft.length > 0 && <> · 확인할 것 {soft.length}건</>}
          </>
        ) : soft.length > 0 ? (
          <>
            고쳐야 할 것은 없습니다 · 확인할 것 <b className="text-amber-800">{soft.length}건</b>
          </>
        ) : (
          <>점검 항목 {checks.length}개를 모두 통과했습니다</>
        )}
      </p>

      <ul className="mt-3 space-y-1.5">
        {checks.map((c) => (
          <li key={c.id} className="flex flex-wrap items-baseline gap-2 text-xs">
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TONE[c.status]}`}>
              {CHECK_STATUS_LABEL[c.status]}
            </span>
            <span className="font-bold text-slate-800">{c.label}</span>
            <span className="text-slate-600">{c.detail}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => exporter.download(documentAsText(doc, checks), fileNameOf(doc))}>
          내려받기
        </Button>
        <Button size="sm" onClick={exporter.print}>
          인쇄
        </Button>
        <Button size="sm" onClick={() => setOpen(!open)} aria-expanded={open}>
          결재선 {open ? '접기' : '보기'}
        </Button>
      </div>

      {/* 내려받기·인쇄가 막히면 사용자는 받은 줄 알고 파일을 찾는다 */}
      {exporter.state.kind === 'done' && (
        <p role="status" className="mt-2 text-[11px] font-bold text-emerald-700">
          {exporter.state.what === '인쇄'
            ? '인쇄 창을 열었습니다'
            : `${exporter.state.what} 내려받았습니다 — 출처와 점검 결과가 함께 들어 있습니다`}
        </p>
      )}
      {exporter.state.kind === 'failed' && (
        <p role="alert" className="mt-2 text-[11px] font-bold text-rose-700">
          {exporter.state.why}
        </p>
      )}

      <p className="mt-2 text-[11px] text-slate-500">
        내려받는 것은 <b>글자 파일</b>입니다. 공문서 서식(PDF·HWP)은 서버가 만들어야 합니다 —
        화면이 흉내 낸 서식은 규격이 아닙니다.
      </p>

      {open && line.kind === 'ready' && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-bold text-slate-500">결재선 (조직도 기준)</p>
          <ol className="mt-1.5 space-y-1">
            {line.data.map((s) => (
              <li key={s.role} className="text-xs text-slate-700">
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {ROLE_LABEL[s.role]}
                </span>{' '}
                {s.name} · {s.dept} {s.title}
              </li>
            ))}
          </ol>
          {!isComplete(line.data) && (
            <p className="mt-2 text-[11px] font-bold text-rose-800">
              {missingRoles(line.data).map((r) => ROLE_LABEL[r]).join(' · ')} 단계가 없습니다 — 올려도
              결재가 진행되지 않습니다
            </p>
          )}
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3">
        {ready ? (
          <Button tone="primary" onClick={submit} disabled={sent && failure === null}>
            결재 상신
          </Button>
        ) : (
          /* 눌러 놓고 서버가 거절하게 두지 않는다 — 무엇을 고쳐야 하는지 여기서 말한다 */
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs font-bold text-rose-900">
              고쳐야 할 것 {bad.length}건이 남아 결재에 올릴 수 없습니다
            </p>
            <ul className="mt-1 space-y-0.5">
              {bad.map((c) => (
                <li key={c.id} className="text-[11px] text-rose-900">
                  {c.label} — {c.detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {failure !== null && (
          <p role="alert" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
            {failure}
          </p>
        )}
      </div>
    </section>
  )
}
