import { useId, useRef, useState } from 'react'
import { CloudUpload } from 'lucide-react'
import { acceptAttr, type UploadSlot } from '@entities/upload/model'

/**
 * 파일 올리는 자리.
 *
 * 에이전트 화면 안에만 있었는데, 대화 우측 패널에도 원본과 같은 자리를 두면서
 * 공용으로 뺐다. 그대로 한 번 더 적었다면 한쪽만 오류를 안 지우거나
 * 같은 파일 두 번 고르기가 한쪽에서만 되는 식으로 갈라졌을 것이다.
 *
 * 부모 컴포넌트 **안에서 정의하지 않는다** — 매 렌더 새 타입이 되어 리마운트되고,
 * 드래그 상태와 파일 입력이 초기화된다(AGENTS.md §6, 이전 데모에서 난 사고).
 *
 * 형식·용량 검사는 훅이 먼저 하고, 여기는 그 결과를 보여 주기만 한다.
 */
export function UploadZone({
  slot,
  /** 자리마다 여백이 다르다 */
  layout = 'mt-3',
  /** 좁은 패널에서는 작게 */
  compact = false,
}: {
  slot: UploadSlot
  layout?: string
  compact?: boolean
}) {
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const take = (files: FileList | null) => {
    const file = files?.[0]
    if (file) slot.select(file)
    // 같은 파일을 다시 고를 수 있게 비운다 — 안 그러면 두 번째 선택이 조용히 무시된다
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={layout}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          take(e.dataTransfer.files)
        }}
        className={`rounded-lg border border-dashed text-center transition-colors ${
          compact ? 'p-3' : 'p-5'
        } ${over ? 'border-brand bg-brand-soft' : 'border-slate-300'}`}
      >
        <CloudUpload
          className={`mx-auto mb-2 text-slate-400 ${compact ? 'size-5' : 'size-7'}`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptAttr(slot.constraint)}
          disabled={slot.busy}
          onChange={(e) => take(e.target.files)}
          aria-describedby={slot.error ? errorId : undefined}
          className="sr-only"
        />
        <label
          htmlFor={inputId}
          className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 ${
            compact ? 'px-3 text-xs' : 'px-4 text-sm'
          }`}
        >
          {slot.busy ? '올리는 중…' : '파일 선택 또는 끌어다 놓기'}
        </label>
        <p className={`mt-2 text-slate-500 ${compact ? 'text-[11px]' : 'text-xs'}`}>
          {slot.constraint.hint}
        </p>
      </div>

      {/* 실패를 조용히 넘기지 않는다 — 무엇이 왜 안 됐는지 말한다 */}
      {slot.error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800"
        >
          {slot.error}
        </p>
      )}
    </div>
  )
}
