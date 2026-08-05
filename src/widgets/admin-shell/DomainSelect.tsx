import { useId } from 'react'
import type { Domain } from '@entities/domain/model'
import { sectorLabel } from '@entities/domain/model'

/**
 * 관리자 화면에서 **어느 발주처의 것을 보는지** 고른다.
 *
 * 관리자는 발주처 소속이 아니다 — 포털에서 들어올 때 발주처를 비운다.
 * 그런데 에이전트 정의·시나리오는 **발주처마다 다른 데이터**다. 고르지 않으면
 * 아무 발주처의 것이나 보여 주게 되고, 그게 이 저장소가 계속 막아 온 사고다.
 *
 * 목록은 부르는 쪽이 넘긴다 — 그쪽이 이미 목록을 들고 **첫 항목을 기본값**으로
 * 쓰기 때문이다. 여기서 또 부르면 두 곳이 서로 다른 목록을 볼 수 있다.
 */
export function DomainSelect({
  domains,
  value,
  onChange,
  note,
}: {
  /** 업무 데이터가 있는 발주처만 넘긴다 — 없는 곳을 고르게 두면 고르는 의미가 없다 */
  domains: Domain[]
  value: string | null
  onChange: (id: string) => void
  /** 왜 골라야 하는지 — 화면마다 다르므로 부르는 쪽이 쓴다 */
  note: string
}) {
  const id = useId()

  return (
    <div className="mt-4 max-w-3xl rounded-xl border border-slate-200 bg-white p-4">
      <label htmlFor={id} className="text-[11px] font-bold text-slate-500">
        발주처
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-900"
      >
        {domains.length === 0 && <option value="">불러오는 중…</option>}
        {domains.map((d) => (
          <option key={d.id} value={d.id}>
            {d.orgName} ({sectorLabel(d.sector)})
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-slate-600">{note}</p>
    </div>
  )
}
